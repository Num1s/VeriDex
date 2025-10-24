require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const LINEA_TESTNET_RPC = process.env.LINEA_TESTNET_RPC || "https://rpc.sepolia.linea.build";
const STATUS_NETWORK_RPC = process.env.STATUS_NETWORK_RPC || "https://public.sepolia.status.network";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      forking: {
        url: LINEA_TESTNET_RPC,
      },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        accountsBalance: "1000000000000000000000", // 1000 ETH
      },
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        accountsBalance: "1000000000000000000000",
      },
    },

    linea_testnet: {
      url: LINEA_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59140,
      gasPrice: 20000000000, // 20 gwei
      gasLimit: 8000000,
    },

    status_network: {
      url: STATUS_NETWORK_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1946, // Status Network Sepolia
      gasPrice: 1000000000, // 1 gwei
      gasLimit: 8000000,
    },

    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 20000000000,
    },

    mainnet: {
      url: process.env.MAINNET_RPC || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: 20000000000,
    },
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },

  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    scripts: "./scripts",
  },
  excludeContracts: ["**/Marketplace.sol", "**/Escrow.sol", "**/VerifierOracle.sol", "**/Roles.sol"],

  mocha: {
    timeout: 40000,
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    treasury: {
      default: 1,
    },
    verifier: {
      default: 2,
    },
    user: {
      default: 3,
    },
  },
};
