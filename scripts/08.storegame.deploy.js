const { ethers } = require('hardhat');
const { writeWithToken } = require('../js-commons/io')
const TOKENS = require('./_v4')
const log = console.log

async function main() {
  log('deploy.....')

  
  const storeGame = (await ethers.getContractFactory('StoreGame')).attach(TOKENS.storeGame)
  // const storeGame = await (await ethers.deployContract('StoreGame')).waitForDeployment()

  writeWithToken({
    storeGame: await storeGame.getAddress()
  }, __filename, 1)

  await (await storeGame.updateGame(TOKENS.amaGame, TOKENS.amaInv)).wait()
}

main().catch(err => log(err)).then(() => log('SUCCESS!'))