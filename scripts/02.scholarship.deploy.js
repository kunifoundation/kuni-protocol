const { ethers } = require('hardhat');
const { writeWithToken } = require('../js-commons/io')
const log = console.log

async function main() {
  log('deploy.....')
  this.scholarship = await (await ethers.deployContract('Scholarship')).waitForDeployment()
  writeWithToken({
    scholarship: await this.scholarship.getAddress(),
  }, __filename, 1)
}

main().catch(err => log(err)).then(() => log('SUCCESS!'))