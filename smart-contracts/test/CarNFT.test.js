const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarNFT", function () {
  let carNFT;
  let owner, verifier, user1, user2;
  let trustedForwarder;

  beforeEach(async function () {
    [owner, verifier, user1, user2] = await ethers.getSigners();

    // Deploy GaslessMetaTx first (mock trusted forwarder)
    const GaslessMetaTx = await ethers.getContractFactory("GaslessMetaTx");
    trustedForwarder = await GaslessMetaTx.deploy(ethers.constants.AddressZero);
    await trustedForwarder.deployed();

    // Deploy CarNFT
    const CarNFT = await ethers.getContractFactory("CarNFT");
    carNFT = await CarNFT.deploy(
      trustedForwarder.address,
      owner.address,
      verifier.address
    );
    await carNFT.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const adminRole = await carNFT.DEFAULT_ADMIN_ROLE();
      expect(await carNFT.hasRole(adminRole, owner.address)).to.equal(true);
    });

    it("Should set the right verifier", async function () {
      const verifierRole = await carNFT.VERIFIER_ROLE();
      expect(await carNFT.hasRole(verifierRole, verifier.address)).to.equal(true);
    });

    it("Should have correct name and symbol", async function () {
      expect(await carNFT.name()).to.equal("AutoToken Car NFT");
      expect(await carNFT.symbol()).to.equal("CAR");
    });
  });

  describe("Minting", function () {
    it("Should mint a new car NFT", async function () {
      const tx = await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      // Check event emission
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "CarMinted");
      expect(event).to.not.be.undefined;
      expect(event.args[1]).to.equal(user1.address);
      expect(event.args[2]).to.equal("1HGCM82633A123456");

      expect(await carNFT.ownerOf(0)).to.equal(user1.address);
      expect(await carNFT.totalSupply()).to.equal(1);
    });

    it("Should store car details correctly", async function () {
      await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      const details = await carNFT.getCarDetails(0);
      expect(details.vin).to.equal("1HGCM82633A123456");
      expect(details.make).to.equal("Toyota");
      expect(details.model).to.equal("Camry");
      expect(details.year).to.equal(2020);
      expect(details.verified).to.equal(false);
    });

    it("Should set correct token URI", async function () {
      await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      expect(await carNFT.tokenURI(0)).to.equal("https://ipfs.io/ipfs/QmTest123");
    });

    it("Should prevent duplicate VIN", async function () {
      await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      try {
        await carNFT.mintCar(
          user2.address,
          "1HGCM82633A123456",
          "Honda",
          "Civic",
          2021,
          "https://ipfs.io/ipfs/QmTest456"
        );
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("CarNFT: VIN already exists");
      }
    });

    it("Should validate input parameters", async function () {
      try {
        await carNFT.mintCar(
          user1.address,
          "",
          "Toyota",
          "Camry",
          2020,
          "https://ipfs.io/ipfs/QmTest123"
        );
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("CarNFT: VIN cannot be empty");
      }

      try {
        await carNFT.mintCar(
          ethers.constants.AddressZero,
          "1HGCM82633A123456",
          "Toyota",
          "Camry",
          2020,
          "https://ipfs.io/ipfs/QmTest123"
        );
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("CarNFT: Cannot mint to zero address");
      }
    });
  });

  describe("Verification", function () {
    beforeEach(async function () {
      await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
    });

    it("Should verify car (only verifier)", async function () {
      try {
        await carNFT.connect(user1).verifyCar(0);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("AccessControl");
      }

      const tx = await carNFT.connect(verifier).verifyCar(0);
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "CarVerified");
      expect(event).to.not.be.undefined;
      expect(event.args[1]).to.equal(verifier.address);

      const details = await carNFT.getCarDetails(0);
      expect(details.verified).to.equal(true);
    });

    it("Should prevent double verification", async function () {
      await carNFT.connect(verifier).verifyCar(0);

      try {
        await carNFT.connect(verifier).verifyCar(0);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("CarNFT: Car already verified");
      }
    });
  });

  describe("VIN Management", function () {
    it("Should track VIN to token mapping", async function () {
      await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );

      expect(await carNFT.getTokenIdByVIN("1HGCM82633A123456")).to.equal(0);
      expect(await carNFT.vinExists("1HGCM82633A123456")).to.equal(true);
      expect(await carNFT.vinExists("NONEXISTENT")).to.equal(false);
    });
  });

  describe("Transfer and Burn", function () {
    beforeEach(async function () {
      await carNFT.mintCar(
        user1.address,
        "1HGCM82633A123456",
        "Toyota",
        "Camry",
        2020,
        "https://ipfs.io/ipfs/QmTest123"
      );
    });

    it("Should transfer NFT correctly", async function () {
      await carNFT.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await carNFT.ownerOf(0)).to.equal(user2.address);
    });

    it("Should clear VIN mapping on burn", async function () {
      await carNFT.connect(user1).burn(0);

      expect(await carNFT.vinExists("1HGCM82633A123456")).to.equal(false);
      try {
        await carNFT.ownerOf(0);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("ERC721: invalid token ID");
      }
    });
  });
});
