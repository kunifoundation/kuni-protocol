const { expect } = require('chai');
const { ethers } = require('hardhat');
const _ = require('lodash')
const { initPowerEffData, initCraftData, initSaruData, toByteByName } = require('../js-commons/ama-data');

const { parseEther, formatEther, deployContract, MaxUint256 } = ethers

const e100 = parseEther('100')
const e50 = parseEther('50')
const log = console.log


describe('------------- Staking token ------------------', () => {
  let owner, bob, alex;
  let tx;
  before(async function() {
    // account init
    [owner, bob, alex, axi, ...addrs] = await ethers.getSigners();
    this.ow = owner
    this.factory = await deployContract('MaterialFactory'); await this.factory.waitForDeployment()
    // this.materials = await this.factory.materials()
  })

  it("00. Create Material", async function() {
    const self = this
    let tx, rep;
    async function create(name, symbol, _owner, minter) {
      const tx = await self.factory.createMaterial(_owner || owner.address, name, symbol)
      const receipt = await tx.wait()
      if (receipt.logs) {
        const rs = receipt.logs.find(({ fragment }) => fragment.name === 'MaterialCreated')
        if (rs) {
          console.log(rs.args[0]);
        }
      }
    }

    await (await this.factory.createMaterial(owner.address, owner.address, "Ore", "ORE")).wait()
    await (await this.factory.createMaterial(owner.address, owner.address, "Stone", "STONE")).wait()
    await (await this.factory.createMaterial(owner.address, owner.address, "Cotton", "COTTON")).wait()
    await (await this.factory.createMaterial(owner.address, owner.address, "Lumber", "LUMBER")).wait()

    // console.log(rep.logs);
    // const materials = await this.factory.materials()
    // const oreAddr = materials[0]
    // tx = await this.factory.mint(oreAddr)
    // rep = await tx.wait()
    // tx = await this.factory.transfer(oreAddr, bob.address, parseEther('0.5'))
    // rep = await tx.wait()
  })
})