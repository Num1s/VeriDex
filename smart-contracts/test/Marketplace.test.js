const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");

describe("Marketplace", function () {
  let marketplace, carNFT, escrow;
  let owner, seller, buyer, verifier, treasury;
  let trustedForwarder;

  beforeEach(async function () {
    [owner, seller, buyer, verifier, treasury] = await ethers.getSigners();

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

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      trustedForwarder.address,
      owner.address,
      treasury.address,
      carNFT.address,
      escrow.address
    );
    await marketplace.deployed();
  });

  describe("Deployment", function () {
    it("Should set correct addresses", async function () {
      expect(await marketplace.carNFT()).to.equal(carNFT.address);
      expect(await marketplace.escrowAddress()).to.equal(escrow.address);
      expect(await marketplace.treasuryAddress()).to.equal(treasury.address);
    });
  });

  describe("Listing", function () {
    beforeEach(async function () {
      // Mint and verify a car
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(verifier).verifyCar(0);
    });

    it("Should create listing", async function () {
      const price = ethers.utils.parseEther("1.0");

      // Set approval for marketplace to transfer NFT
      await carNFT.connect(seller).setApprovalForAll(marketplace.address, true);

      const tx = await marketplace.connect(seller).createListing(0, price);
      await expect(tx)
        .to.emit(marketplace, "ListingCreated")
        .withArgs(0, 0, seller.address, price);

      const listing = await marketplace.getListing(0);
      expect(listing.tokenId).to.equal(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.equal(true);
    });

    it("Should prevent listing unverified car", async function () {
      // Mint another car without verification
      await carNFT.mintCar(
        seller.address,
        "2HGCM82633A123456",
        "Honda",
        "Civic",
        2021,
        "https://ipfs.io/ipfs/QmTest456"
      );

      await expect(
        marketplace.connect(seller).createListing(1, ethers.utils.parseEther("1.0"))
      ).to.be.revertedWith("Marketplace: Car must be verified");
    });

    it("Should prevent listing already listed token", async function () {
      await marketplace.connect(seller).createListing(0, ethers.utils.parseEther("1.0"));

      await expect(
        marketplace.connect(seller).createListing(0, ethers.utils.parseEther("2.0"))
      ).to.be.revertedWith("Marketplace: Token already listed");
    });

    it("Should validate listing price", async function () {
      await expect(
        marketplace.connect(seller).createListing(0, 0)
      ).to.be.revertedWith("Marketplace: Price must be greater than 0");
    });
  });

  describe("Purchasing", function () {
    let listingPrice;

    beforeEach(async function () {
      // Setup: mint, verify, and list car
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(verifier).verifyCar(0);

      listingPrice = ethers.utils.parseEther("1.0");
      await marketplace.connect(seller).createListing(0, listingPrice);

      // Transfer ownership to marketplace
      await carNFT.connect(seller).transferFrom(seller.address, marketplace.address, 0);
    });

    it("Should purchase listing", async function () {
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      const tx = await marketplace.connect(buyer).purchaseListing(0, {
        value: listingPrice
      });

      await expect(tx)
        .to.emit(marketplace, "ListingPurchased")
        .withArgs(0, 0, buyer.address, seller.address, listingPrice);

      // Check NFT ownership
      expect(await carNFT.ownerOf(0)).to.equal(buyer.address);

      // Check payment distribution (2% fee = 0.02 ETH to treasury, 0.98 ETH to seller)
      const fee = listingPrice.mul(200).div(10000); // 2%
      const sellerAmount = listingPrice.sub(fee);

      expect(await ethers.provider.getBalance(treasury.address))
        .to.equal(initialTreasuryBalance.add(fee));
      expect(await ethers.provider.getBalance(seller.address))
        .to.equal(initialSellerBalance.add(sellerAmount));
    });

    it("Should reject insufficient payment", async function () {
      await expect(
        marketplace.connect(buyer).purchaseListing(0, {
          value: ethers.utils.parseEther("0.5")
        })
      ).to.be.revertedWith("Marketplace: Insufficient payment");
    });

    it("Should prevent buying own listing", async function () {
      await expect(
        marketplace.connect(seller).purchaseListing(0, {
          value: listingPrice
        })
      ).to.be.revertedWith("Marketplace: Cannot buy own listing");
    });

    it("Should refund excess payment", async function () {
      const excessAmount = ethers.utils.parseEther("2.0");
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      await marketplace.connect(buyer).purchaseListing(0, {
        value: excessAmount
      });

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      const refund = excessAmount.sub(listingPrice);

      // Buyer should be refunded excess amount (minus gas fees)
      expect(finalBuyerBalance).to.be.closeTo(
        initialBuyerBalance.sub(listingPrice),
        ethers.utils.parseEther("0.01") // Allow for gas fees
      );
    });
  });

  describe("Listing Management", function () {
    beforeEach(async function () {
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await carNFT.connect(verifier).verifyCar(0);
      await marketplace.connect(seller).createListing(0, ethers.utils.parseEther("1.0"));
    });

    it("Should update listing price", async function () {
      const newPrice = ethers.utils.parseEther("1.5");

      await expect(marketplace.connect(seller).updateListing(0, newPrice))
        .to.emit(marketplace, "ListingUpdated")
        .withArgs(0, ethers.utils.parseEther("1.0"), newPrice);

      const listing = await marketplace.getListing(0);
      expect(listing.price).to.equal(newPrice);
    });

    it("Should cancel listing", async function () {
      await expect(marketplace.connect(seller).cancelListing(0))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(0);

      const listing = await marketplace.getListing(0);
      expect(listing.active).to.equal(false);

      // NFT should be returned to seller
      expect(await carNFT.ownerOf(0)).to.equal(seller.address);
    });

    it("Should prevent non-owner from updating listing", async function () {
      await expect(
        marketplace.connect(buyer).updateListing(0, ethers.utils.parseEther("2.0"))
      ).to.be.revertedWith("Marketplace: Not listing owner");
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to withdraw funds", async function () {
      // Send some ETH to marketplace
      await owner.sendTransaction({
        to: marketplace.address,
        value: ethers.utils.parseEther("1.0")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      await marketplace.connect(owner).emergencyWithdraw();

      expect(await ethers.provider.getBalance(marketplace.address)).to.equal(0);
    });

    it("Should prevent non-admin from withdrawing", async function () {
      await expect(marketplace.connect(seller).emergencyWithdraw())
        .to.be.revertedWith("AccessControl: account");
    });
  });
});
