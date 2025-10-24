const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting AutoToken deployment...");

  const [deployer, treasury, verifier] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Treasury address:", treasury.address);
  console.log("Verifier address:", verifier.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Deploy GaslessMetaTx (trusted forwarder)
  console.log("\n📦 Deploying GaslessMetaTx...");
  const GaslessMetaTx = await ethers.getContractFactory("GaslessMetaTx");
  const trustedForwarder = await GaslessMetaTx.deploy(deployer.address);
  await trustedForwarder.deployed();
  console.log("✅ GaslessMetaTx deployed to:", trustedForwarder.address);

  // Deploy Roles
  console.log("\n📦 Deploying Roles...");
  const Roles = await ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(
    trustedForwarder.address,
    deployer.address, // admin
    verifier.address, // verifier
    treasury.address  // treasury
  );
  await roles.deployed();
  console.log("✅ Roles deployed to:", roles.address);

  // Deploy CarNFT
  console.log("\n📦 Deploying CarNFT...");
  const CarNFT = await ethers.getContractFactory("CarNFT");
  const carNFT = await CarNFT.deploy(
    trustedForwarder.address,
    deployer.address, // admin
    verifier.address  // verifier
  );
  await carNFT.deployed();
  console.log("✅ CarNFT deployed to:", carNFT.address);

  // Deploy Escrow
  console.log("\n📦 Deploying Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    trustedForwarder.address,
    deployer.address, // admin
    verifier.address, // verifier
    carNFT.address    // CarNFT address
  );
  await escrow.deployed();
  console.log("✅ Escrow deployed to:", escrow.address);

  // Deploy Marketplace
  console.log("\n📦 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    trustedForwarder.address,
    deployer.address, // admin
    treasury.address, // treasury
    carNFT.address,   // CarNFT address
    escrow.address    // Escrow address
  );
  await marketplace.deployed();
  console.log("✅ Marketplace deployed to:", marketplace.address);

  // Deploy VerifierOracle
  console.log("\n📦 Deploying VerifierOracle...");
  const VerifierOracle = await ethers.getContractFactory("VerifierOracle");
  const verifierOracle = await VerifierOracle.deploy(
    trustedForwarder.address,
    deployer.address, // admin
    verifier.address, // verifier
    carNFT.address,   // CarNFT address
    escrow.address    // Escrow address
  );
  await verifierOracle.deployed();
  console.log("✅ VerifierOracle deployed to:", verifierOracle.address);

  // Verify contracts on block explorer (if API key is provided)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Verifying contracts...");

    try {
      await hre.run("verify:verify", {
        address: trustedForwarder.address,
        constructorArguments: [deployer.address],
      });
      console.log("✅ GaslessMetaTx verified");
    } catch (error) {
      console.log("❌ GaslessMetaTx verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: carNFT.address,
        constructorArguments: [
          trustedForwarder.address,
          deployer.address,
          verifier.address
        ],
      });
      console.log("✅ CarNFT verified");
    } catch (error) {
      console.log("❌ CarNFT verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [
          trustedForwarder.address,
          deployer.address,
          treasury.address,
          carNFT.address,
          escrow.address
        ],
      });
      console.log("✅ Marketplace verified");
    } catch (error) {
      console.log("❌ Marketplace verification failed:", error.message);
    }
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    treasury: treasury.address,
    verifier: verifier.address,
    contracts: {
      GaslessMetaTx: trustedForwarder.address,
      Roles: roles.address,
      CarNFT: carNFT.address,
      Escrow: escrow.address,
      Marketplace: marketplace.address,
      VerifierOracle: verifierOracle.address,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = "./deployment.json";
  fs.writeFileSync(path, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to ${path}`);

  console.log("\n🎉 AutoToken deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Fund the treasury address:", treasury.address);
  console.log("2. Set up gasless relayer with trusted forwarder:", trustedForwarder.address);
  console.log("3. Deploy frontend and connect to contracts");
  console.log("4. Test the complete flow: mint -> verify -> list -> buy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

