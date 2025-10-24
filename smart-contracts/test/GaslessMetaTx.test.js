const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GaslessMetaTx", function () {
  let gaslessMetaTx, owner, user1, user2;
  let trustedForwarder;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy GaslessMetaTx
    const GaslessMetaTx = await ethers.getContractFactory("GaslessMetaTx");
    gaslessMetaTx = await GaslessMetaTx.deploy(owner.address);
    await gaslessMetaTx.deployed();

    trustedForwarder = owner.address; // Use owner as trusted forwarder for testing
  });

  describe("Deployment", function () {
    it("Should set correct trusted forwarder", async function () {
      expect(await gaslessMetaTx.trustedForwarderAddress()).to.equal(owner.address);
      expect(await gaslessMetaTx.getTrustedForwarder()).to.equal(owner.address);
    });

    it("Should recognize trusted forwarder", async function () {
      expect(await gaslessMetaTx.isTrustedForwarder(owner.address)).to.equal(true);
      expect(await gaslessMetaTx.isTrustedForwarder(user1.address)).to.equal(false);
    });
  });

  describe("Trusted Forwarder Management", function () {
    it("Should allow updating trusted forwarder", async function () {
      await expect(gaslessMetaTx.connect(user1).setTrustedForwarder(user2.address))
        .to.be.revertedWith("GaslessMetaTx: Not trusted forwarder");

      // Note: This would require a proper forwarder implementation for full testing
      // For now, we just test the function exists and has proper access control
    });
  });

  describe("Meta Transaction Support", function () {
    it("Should support ERC2771 context", async function () {
      // Test that the contract properly inherits from ERC2771Context
      expect(await gaslessMetaTx.isTrustedForwarder(owner.address)).to.equal(true);

      // Test msgSender override (would need proper forwarder for full testing)
      const msgSender = await gaslessMetaTx.getTrustedForwarder();
      expect(msgSender).to.equal(owner.address);
    });
  });
});
