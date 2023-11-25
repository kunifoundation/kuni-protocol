const { expect } = require('chai');
const { ethers } = require('hardhat');
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const _ = require('lodash');
const { parseUnits } = require('ethers');

const { parseEther, formatEther, deployContract, MaxUint256 } = ethers

const e100 = parseEther('100')
const e50 = parseEther('50')
const p16 = parseUnits('1', 16)
const log = console.log

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('------------- Staking token ------------------', () => {
  let owner, bob, alex;
  let tx;
  before(async function() {
    // account init
    [owner, bob, alex, axi, ...addrs] = await ethers.getSigners();
    this.ow = owner
    
    this.ge     = await (await deployContract('GreenEnergy')).waitForDeployment();
    // this.ge2    = await (await deployContract('GreenEnergy', [owner.address])).waitForDeployment();
    this.mining = await (await deployContract('MiningKuni')).waitForDeployment();

    await (await this.ge.setMinter(await owner.getAddress())).wait()

    tx = await this.ge.mint(bob.address, e100)
    await tx.wait()
    // tx = await this.ge2.mint(alex.address, e100 + e100 )
    // await tx.wait()

    log(await this.ge.getAddress(), alex.address)
    tx = await this.mining.addPool(await this.ge.getAddress(), [owner.address, bob.address])
    await tx.wait()
    // tx = await this.mining.addPool(await this.ge2.getAddress(), [alex.address])
    // await tx.wait()

    // tx = await this.mining.connect(owner).gasUsedDeclaration(e100, 0)
    // await tx.wait()

    tx = await this.mining.connect(bob).testGas()
    await tx.wait()
    // await expect(this.mining.connect(bob).gasUsedDeclaration(await this.ge.getAddress(), e100)).to.be.revertedWith('AMA: IS_NOT_MINTER')
    // tx = await this.mining.connect(owner).gasUsedDeclaration(e100, 0)
    // await tx.wait()
  })

  it("00. mine kuni", async function() {
    const self = this
    async function mineKuni(acc, ge) {
      log('kuni mining: ', formatEther(await self.mining.balanceOf(acc.address)))
      if ((await ge.allowance(acc.address, await self.mining.getAddress())) == 0) {
        tx = await ge.connect(acc).approve(await self.mining.getAddress(), MaxUint256);
        await tx.wait()
      }
      
      log(formatEther(await ge.balanceOf(acc.address)))
      tx = await self.mining.connect(acc).mineKuni(await ge.getAddress(), e50)
      await tx.wait()
      log(await ethers.provider.getBlockNumber())
      log(formatEther((await self.mining.userInfo(await ge.getAddress(), acc.address)).amount))
      await sleep(500)
      // tx = await self.mining.connect(acc).claimKuni(await ge.getAddress(), e100)
      // await tx.wait()
      log(formatEther((await self.mining.userInfo(await ge.getAddress(), acc.address)).amount))
      log('kuni player: ', formatEther(await self.mining.balanceOf(acc.address)))
    }
    
    await mineKuni(bob, self.ge)
    await mine(20)
    log('pedding', (await this.mining.peddingReward(await this.ge.getAddress(), bob.address))/p16)
    // await mineKuni(alex, self.ge2)
    log(await ethers.provider.getBlockNumber())
    tx = await this.mining.connect(bob).claimKuni(await this.ge.getAddress(), e50)
    await tx.wait()
    log('kuni mining claim: ', (await this.mining.balanceOf(await bob.address))/p16)
    log('ama:', await this.mining.totalGasUsed())
  })
})