const { expect } = require('chai');
const { ethers } = require('hardhat');
const _ = require('lodash')
const { initPowerEffData, initCraftData, initSaruData, toByteByName } = require('../js-commons/ama-data');

const { deployContract, getContractFactory } = ethers

const log = console.log

function exData(expected, actual, fix) {
  if (fix) {
    const magic = BigInt(Math.pow(10, (18-fix)))
    actual = actual.map(t => t/magic)
  }
  for (let index = 0; index < expected.length; index++) {
    expect(expected[index]).equal(actual[index])
  }
}


describe('------------- Staking token ------------------', () => {
  let deployer, bob, alex, addrs;
  let tx;
  before(async function() {
    // account init
    [deployer, bob, alex, axi, ...addrs] = await ethers.getSigners();
    
    this.meta = await (await deployContract('MetaData')).waitForDeployment()
    this.eco = await (await getContractFactory('EcoGame')).deploy(await this.meta.getAddress())
    await initPowerEffData(this.meta)
    await initCraftData(this.meta)
    // 1 - 10
    await initSaruData(this.meta, 0, 10)
    
  })

  it("00. Create Material", async function() {
    const ex1 = [110, 180, 150, 10] 
    const eff = await this.eco.productionEfficiency(1)
    exData(ex1, eff, 2)
    const ex2 = [30, 130, 30, 190]
    const eff2 = await this.eco.productionEfficiency(2)
    exData(ex2, eff2, 2)

    // let exTeam = ex1
    // for (let i = 0; i < ex2.length; i++) {
    //   exTeam[i] += ex2[i];
    // }

    const exTeam = [140, 310, 180, 200]
    const aTeam = await this.eco.productionEfficiencyTeam([1, 2])
    exData(exTeam, aTeam, 2)
  })

  it('01. thuandv', async function() {
    log('land ', await this.eco.getLandArr(bob.address))
  })
})
