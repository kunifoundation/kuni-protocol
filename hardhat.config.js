require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
const fs = require('fs');
require("solidity-docgen")
const mnemonic_testnet = fs.readFileSync(".secret-bsctestnet").toString().trim()
const mnemonic_mainnet = fs.readFileSync(".secret-mainnet").toString().trim()


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  name: "Amakuni Core",
  // defaultNetwork: 'bsc',
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    bsctestnet: {
      url: 'https://bsc-testnet.publicnode.com',
      chainId: 97,
      gasPrice: 5000000000,
      accounts: mnemonic_testnet.split(',')
    },
    mainnet: {
        url: 'https://bsc-dataseed1.binance.org',  
        chainId: 56,
        gasPrice: 3000000000,
        accounts: mnemonic_mainnet.split(',')
      },
  },
  mocha: {
    timeout: 2000000
  },
  docgen: {
    root: process.cwd(),
    sourcesDir: './contracts',
    outputDir: 'docs',
    pages: () => "README.MD",
    exclude: [],
    theme: 'markdown',
    collapseNewlines: true,
    pageExtension: '.md',
  },
  gasReporter: {
    enabled: true
  }
};

