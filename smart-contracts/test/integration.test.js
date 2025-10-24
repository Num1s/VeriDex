const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");

describe("AutoToken Integration", function () {
  let carNFT, marketplace, escrow, verifierOracle, roles;
  let owner, admin, verifier, seller, buyer, treasury;
  let trustedForwarder;

  beforeEach(async function () {
    [owner, admin, verifier, seller, buyer, treasury] = await ethers.getSigners();

    // Deploy GaslessMetaTx first
    const GaslessMetaTx = await ethers.getContractFactory("GaslessMetaTx");
    trustedForwarder = await GaslessMetaTx.deploy(owner.address);
    await trustedForwarder.deployed();

    // Deploy Roles contract
    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(trustedForwarder.address, admin.address, verifier.address, treasury.address);
    await roles.deployed();

    // Deploy CarNFT
    const CarNFT = await ethers.getContractFactory("CarNFT");
    carNFT = await CarNFT.deploy(trustedForwarder.address, admin.address, verifier.address);
    await carNFT.deployed();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(trustedForwarder.address, admin.address, verifier.address, carNFT.address);
    await escrow.deployed();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      trustedForwarder.address,
      admin.address,
      treasury.address,
      carNFT.address,
      escrow.address
    );
    await marketplace.deployed();

    // Deploy VerifierOracle
    const VerifierOracle = await ethers.getContractFactory("VerifierOracle");
    verifierOracle = await VerifierOracle.deploy(
      trustedForwarder.address,
      admin.address,
      verifier.address,
      carNFT.address,
      escrow.address
    );
    await verifierOracle.deployed();
  });

  describe("Complete Flow", function () {
    it("Should complete full car tokenization and trading flow", async function () {
      // 1. Mint car NFT
      const tx1 = await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      await expect(tx1)
        .to.emit(carNFT, "CarMinted")
        .withArgs(0, seller.address, "1HGCM82633A123456");

      expect(await carNFT.ownerOf(0)).to.equal(seller.address);

      // 2. Request verification
      const verificationFee = await verifierOracle.verificationFee();
      await verifierOracle.connect(seller).requestVerification(0, "QmVerificationDocs", {
        value: verificationFee
      });

      // 3. Verify car
      await expect(verifierOracle.connect(verifier).completeVerification(0, 1, "Verified successfully"))
        .to.emit(verifierOracle, "VerificationCompleted")
        .withArgs(0, 0, verifier.address, 1, "Verified successfully");

      // Check car is verified
      const carDetails = await carNFT.getCarDetails(0);
      expect(carDetails.verified).to.equal(true);

      // 4. Create marketplace listing
      await carNFT.connect(seller).transferFrom(seller.address, marketplace.address, 0);

      const listingPrice = ethers.utils.parseEther("1.0");
      const tx3 = await marketplace.connect(seller).createListing(0, listingPrice);

      await expect(tx3)
        .to.emit(marketplace, "ListingCreated")
        .withArgs(0, 0, seller.address, listingPrice);

      // 5. Purchase through escrow
      const tx4 = await marketplace.connect(buyer).purchaseWithEscrow(0, {
        value: listingPrice
      });

      await expect(tx4)
        .to.emit(marketplace, "ListingPurchased")
        .withArgs(0, 0, buyer.address, seller.address, listingPrice)
        .to.emit(escrow, "EscrowCreated")
        .withArgs(0, 0, seller.address, buyer.address, listingPrice);

      // Check NFT is in escrow
      expect(await carNFT.ownerOf(0)).to.equal(escrow.address);
      expect(await escrow.isTokenInEscrow(0)).to.equal(true);

      // 6. Release escrow (simulating verification completion)
      await escrow.connect(verifier).releaseEscrow(0);

      // Check final ownership
      expect(await carNFT.ownerOf(0)).to.equal(buyer.address);
      expect(await escrow.isTokenInEscrow(0)).to.equal(false);
    });

    it("Should handle platform fees correctly", async function () {
      // Setup verified car
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
      await verifierOracle.connect(seller).requestVerification(0, "QmVerificationDocs", {
        value: await verifierOracle.verificationFee()
      });
      await verifierOracle.connect(verifier).completeVerification(0, 1, "Verified");

      // Create listing
      await carNFT.connect(seller).transferFrom(seller.address, marketplace.address, 0);
      const listingPrice = ethers.utils.parseEther("1.0");
      await marketplace.connect(seller).createListing(0, listingPrice);

      // Track balances
      const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      // Purchase
      await marketplace.connect(buyer).purchaseListing(0, {
        value: listingPrice
      });

      // Calculate expected fees (2% = 0.02 ETH)
      const platformFee = listingPrice.mul(200).div(10000);
      const sellerAmount = listingPrice.sub(platformFee);

      expect(await ethers.provider.getBalance(treasury.address))
        .to.equal(initialTreasuryBalance.add(platformFee));
    });

    it("Should prevent operations on unverified cars", async function () {
      // Mint car without verification
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      // Should not be able to list unverified car
      await expect(
        marketplace.connect(seller).createListing(0, ethers.utils.parseEther("1.0"))
      ).to.be.revertedWith("Marketplace: Car must be verified");
    });
  });

  describe("Role Management", function () {
    it("Should manage roles correctly", async function () {
      // Check initial roles
      expect(await roles.hasRole(await roles.ADMIN_ROLE(), admin.address)).to.equal(true);
      expect(await roles.hasRole(await roles.VERIFIER_ROLE(), verifier.address)).to.equal(true);

      // Grant additional roles
      await roles.connect(admin).grantRole(await roles.VERIFIER_ROLE(), seller.address);

      expect(await roles.hasRole(await roles.VERIFIER_ROLE(), seller.address)).to.equal(true);

      // Revoke role
      await roles.connect(admin).revokeRole(await roles.VERIFIER_ROLE(), seller.address);

      expect(await roles.hasRole(await roles.VERIFIER_ROLE(), seller.address)).to.equal(false);
    });
  });

  describe("Gasless Transaction Support", function () {
    it("Should support gasless transactions", async function () {
      // All contracts should have trusted forwarder support
      expect(await carNFT.getTrustedForwarder()).to.equal(trustedForwarder.address);
      expect(await marketplace.getTrustedForwarder()).to.equal(trustedForwarder.address);
      expect(await escrow.getTrustedForwarder()).to.equal(trustedForwarder.address);
      expect(await verifierOracle.getTrustedForwarder()).to.equal(trustedForwarder.address);
    });
  });

  describe("Error Recovery", function () {
    it("Should handle failed verification gracefully", async function () {
      await carNFT.mintCar(
        seller.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      await verifierOracle.connect(seller).requestVerification(0, "QmVerificationDocs", {
        value: await verifierOracle.verificationFee()
      });

      // Reject verification
      await verifierOracle.connect(verifier).completeVerification(0, 2, "Verification failed");

      const carDetails = await carNFT.getCarDetails(0);
      expect(carDetails.verified).to.equal(false);

      // Should not be able to list rejected car
      await expect(
        marketplace.connect(seller).createListing(0, ethers.utils.parseEther("1.0"))
      ).to.be.revertedWith("Marketplace: Car must be verified");
    });

    it("Should handle escrow disputes", async function () {
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

      await escrow.createEscrow(0, seller.address, buyer.address, ethers.utils.parseEther("1.0"), {
        value: ethers.utils.parseEther("1.0")
      });

      // Create dispute
      await escrow.connect(buyer).disputeEscrow(0, "Car not as described");

      const deal = await escrow.getEscrowDeal(0);
      expect(deal.state).to.equal(4); // Disputed

      // Admin should be able to resolve (though our simplified version throws)
      await expect(escrow.connect(admin).resolveDispute(0, true))
        .to.be.revertedWith("Dispute resolution not implemented");
    });
  });
});
