require("@nomiclabs/hardhat-waffle");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("dotenv").config();

require("dotenv").config({ path: __dirname + "/.env" });

const { PRIVATE_KEY, ETHERSCAN, POLYGONSCAN, FTMSCAN, OPTSCAN } = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    // mainnet: {
    //   url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    //   accounts: [PRIVATE_KEY],
    //   gasPrice: 26 * 1e9,
    //   chainId: 1,
    // },
    sepolia: {
      url: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    optimisticSepolia: {
      url: "https://sepolia.optimism.io",
      accounts: [PRIVATE_KEY],
      chainId: 11155420,
    },
    opbnb: {
      url: "https://opbnb-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
      accounts: [PRIVATE_KEY],
      chainId: 5611,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [PRIVATE_KEY],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [PRIVATE_KEY],
      // gasPrice: 217 * 1e9,
    },
    mumbai: {
      networkId: 80001,
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [PRIVATE_KEY],
      gasPrice: 35000000000,
    },
    ftmTestnet: {
      networkId: 4002,
      url: "https://rpc.testnet.fantom.network",
      accounts: [PRIVATE_KEY],
      // gasPrice: 35000000000,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN,
      ropsten: ETHERSCAN,
      rinkeby: ETHERSCAN,
      goerli: ETHERSCAN,
      kovan: ETHERSCAN,
      goerli: ETHERSCAN,
      sepolia: ETHERSCAN,
      // ftm
      opera: FTMSCAN,
      ftmTestnet: FTMSCAN,
      // polygon
      polygon: POLYGONSCAN,
      polygonMumbai: POLYGONSCAN,
      optimisticSepolia: OPTSCAN,
    },
    customChains: [
      {
        network: "optimisticSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimism.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/",
        },
      },
    ],
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 80000,
  },
};
