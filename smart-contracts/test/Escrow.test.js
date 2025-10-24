const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");

describe("Escrow", function () {
  let escrow, carNFT;
  let owner, seller, buyer, verifier, admin;
  let trustedForwarder;

  beforeEach(async function () {
    [owner, seller, buyer, verifier, admin] = await ethers.getSigners();

    // Deploy contracts
    const GaslessMetaTx = await ethers.getContractFactory("GaslessMetaTx");
    trustedForwarder = await GaslessMetaTx.deploy(ethers.constants.AddressZero);
    await trustedForwarder.deployed();

    const CarNFT = await ethers.getContractFactory("CarNFT");
    carNFT = await CarNFT.deploy(trustedForwarder.address, owner.address, verifier.address);
    await carNFT.deployed();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(trustedForwarder.address, owner.address, verifier.address, carNFT.address);
    await escrow.deployed();
  });

  describe("Deployment", function () {
    it("Should set correct CarNFT address", async function () {
      expect(await escrow.carNFT()).to.equal(carNFT.address);
    });

    it("Should set correct roles", async function () {
      expect(await escrow.hasRole(await escrow.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await escrow.hasRole(await escrow.VERIFIER_ROLE(), verifier.address)).to.equal(true);
    });
  });

  describe("Escrow Creation", function () {
    beforeEach(async function () {
      // Mint car and transfer to escrow
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(seller).transferFrom(seller.address, escrow.address, 0);
    });

    it("Should create escrow deal", async function () {
      const amount = ethers.utils.parseEther("1.0");

      const tx = await escrow.createEscrow(0, seller.address, buyer.address, amount, {
        value: amount
      });

      await expect(tx)
        .to.emit(escrow, "EscrowCreated")
        .withArgs(0, 0, seller.address, buyer.address, amount);

      const deal = await escrow.getEscrowDeal(0);
      expect(deal.tokenId).to.equal(0);
      expect(deal.seller).to.equal(seller.address);
      expect(deal.buyer).to.equal(buyer.address);
      expect(deal.amount).to.equal(amount);
      expect(deal.state).to.equal(1); // Funded
    });

    it("Should reject incorrect payment amount", async function () {
      const amount = ethers.utils.parseEther("1.0");

      await expect(
        escrow.createEscrow(0, seller.address, buyer.address, amount, {
          value: ethers.utils.parseEther("0.5")
        })
      ).to.be.revertedWith("Escrow: Incorrect payment amount");
    });

    it("Should prevent escrow for non-escrow NFT", async function () {
      // Mint another car but don't transfer to escrow
      await carNFT.mintCar(
        buyer.address,
        "2HGCM82633A123456",
        "Honda",
        "Civic",
        2021,
        "https://ipfs.io/ipfs/QmTest456"
      );

      await expect(
        escrow.createEscrow(1, seller.address, buyer.address, ethers.utils.parseEther("1.0"), {
          value: ethers.utils.parseEther("1.0")
        })
      ).to.be.revertedWith("Escrow: NFT not in escrow");
    });
  });

  describe("Escrow Release", function () {
    let dealId;

    beforeEach(async function () {
      // Setup escrow
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(seller).transferFrom(seller.address, escrow.address, 0);

      const amount = ethers.utils.parseEther("1.0");
      await escrow.createEscrow(0, seller.address, buyer.address, amount, {
        value: amount
      });
      dealId = 0;
    });

    it("Should release escrow (only verifier)", async function () {
      await expect(escrow.connect(seller).releaseEscrow(dealId))
        .to.be.revertedWith("AccessControl: account");

      const tx = await escrow.connect(verifier).releaseEscrow(dealId);

      await expect(tx)
        .to.emit(escrow, "EscrowReleased")
        .withArgs(dealId, verifier.address);

      // Check final state
      const deal = await escrow.getEscrowDeal(dealId);
      expect(deal.state).to.equal(2); // Released
      expect(deal.releasedAt).to.be.gt(0);

      // Check NFT and payment transfer
      expect(await carNFT.ownerOf(0)).to.equal(buyer.address);
      expect(await ethers.provider.getBalance(seller.address))
        .to.be.gt(await ethers.provider.getBalance(buyer.address)); // Seller got payment
    });

    it("Should reject release of unfunded escrow", async function () {
      // Create escrow without payment
      await carNFT.connect(seller).transferFrom(seller.address, escrow.address, 0);
      await escrow.createEscrow(0, seller.address, buyer.address, 0);

      await expect(escrow.connect(verifier).releaseEscrow(1))
        .to.be.revertedWith("Escrow: Deal not funded");
    });
  });

  describe("Escrow Cancellation", function () {
    let dealId;

    beforeEach(async function () {
      // Setup escrow
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(seller).transferFrom(seller.address, escrow.address, 0);

      const amount = ethers.utils.parseEther("1.0");
      await escrow.createEscrow(0, seller.address, buyer.address, amount, {
        value: amount
      });
      dealId = 0;
    });

    it("Should cancel escrow (admin)", async function () {
      const tx = await escrow.connect(owner).cancelEscrow(dealId);

      await expect(tx)
        .to.emit(escrow, "EscrowCancelled")
        .withArgs(dealId, owner.address);

      const deal = await escrow.getEscrowDeal(dealId);
      expect(deal.state).to.equal(3); // Cancelled

      // Check NFT returned to seller
      expect(await carNFT.ownerOf(0)).to.equal(seller.address);
    });

    it("Should auto-cancel after 7 days", async function () {
      // Increase time by 8 days
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await escrow.connect(buyer).cancelEscrow(dealId);

      const deal = await escrow.getEscrowDeal(dealId);
      expect(deal.state).to.equal(3); // Cancelled
    });

    it("Should reject cancellation by non-admin before timeout", async function () {
      await expect(escrow.connect(buyer).cancelEscrow(dealId))
        .to.be.revertedWith("Escrow: Cannot cancel deal");
    });
  });

  describe("Dispute Management", function () {
    let dealId;

    beforeEach(async function () {
      // Setup escrow
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(seller).transferFrom(seller.address, escrow.address, 0);

      const amount = ethers.utils.parseEther("1.0");
      await escrow.createEscrow(0, seller.address, buyer.address, amount, {
        value: amount
      });
      dealId = 0;
    });

    it("Should allow dispute by either party", async function () {
      await expect(escrow.connect(seller).disputeEscrow(dealId, "Car has issues"))
        .to.emit(escrow, "EscrowDisputed")
        .withArgs(dealId, seller.address);

      const deal = await escrow.getEscrowDeal(dealId);
      expect(deal.state).to.equal(4); // Disputed
      expect(deal.notes).to.equal("Car has issues");
    });

    it("Should prevent dispute resolution by non-admin", async function () {
      await escrow.connect(seller).disputeEscrow(dealId, "Dispute");

      await expect(escrow.connect(seller).resolveDispute(dealId, true))
        .to.be.revertedWith("AccessControl: account");
    });
  });

  describe("Token Escrow Check", function () {
    it("Should track tokens in escrow", async function () {
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      expect(await escrow.isTokenInEscrow(0)).to.equal(false);

      await carNFT.connect(seller).transferFrom(seller.address, escrow.address, 0);
      await escrow.createEscrow(0, seller.address, buyer.address, ethers.utils.parseEther("1.0"), {
        value: ethers.utils.parseEther("1.0")
      });

      expect(await escrow.isTokenInEscrow(0)).to.equal(true);
    });
  });
});
