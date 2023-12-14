require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
const fs = require('fs');
require("solidity-docgen")
const mnemonic = fs.readFileSync(".secret-bsc").toString().trim()


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
    bsc: {
      url: 'https://bsc-testnet.publicnode.com',
      // url: 'https://bsc-testnet.blockpi.network/v1/rpc/public',
      // url: 'https://data-seed-prebsc-1-s2.binance.org:8545',
      // url: 'https://data-seed-prebsc-2-s1.bnbchain.org:8545',
      // url: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
      // url: 'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
      // url: 'https://data-seed-prebsc-1-s2.bnbchain.org:8545',
      // url: 'https://data-seed-prebsc-1-s3.bnbchain.org:8545',
      // url: 'https://data-seed-prebsc-2-s3.bnbchain.org:8545',
      // url: 'https://endpoints.omniatech.io/v1/bsc/testnet/public',
      // url: 'https://api.zan.top/node/v1/bsc/testnet/public',
      // url: 'https://bsc-testnet.public.blastapi.io',
      // url: 'https://bsctestapi.terminet.io/rpc',

      chainId: 97,
      gasPrice: 5000000000,
      accounts: mnemonic.split(',')
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

