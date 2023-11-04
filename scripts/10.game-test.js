const { ethers } = require('hardhat');
const _ = require('lodash')
const TOKENS = require('./_v4');
const ABI = require('./abis');
const { toNumber, parseEther, parseUnits } = require('ethers');

const { MaxUint256 } = ethers

const p16 = parseUnits('1', 16)


const log = console.log

const wATU = '0x57404C0B6592368D7f1367e7633919e212Db9286'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTokenIds(nft, addr) {
  const total = await nft.balanceOf(addr)
  const tokenIds = (await Promise.all(_.range(0, toNumber(total)).map(index => nft.tokenOfOwnerByIndex(addr, index)))).map(t => toNumber(t))

  return { total, tokenIds }
}

async function approveToken(token, acc, operator) {
  if (await token.allowance(acc.address, operator) <= 0) {
    const t = await token.connect(acc).approve(operator, MaxUint256)
    await t.wait()
    await sleep(150)
    log('approve ', await token.getAddress())
  }
}

async function approveNft(token, acc, operator) {
  if (!(await token.isApprovedForAll(acc.address, operator))) {
    await (await token.connect(acc).setApprovalForAll(operator, true)).wait()
    log('approve nft ', await token.getAddress())
  }
}

async function loadContractFrom(cName, addr) {
  const contract = await ethers.getContractFactory(cName)
  return contract.attach(addr);
}

async function loadContractAt(abi, address, signer) {
  const c = await ethers.getContractAt(abi, address, signer)
  return c
}

 
async function logKuniItemMeta(c, tokenId) {
  const v = await c.getMeta(tokenId)
  log('TokenId\t', tokenId)
  log('Name\t', v[0])
  log('Slash\t', toNumber(v[1]/p16)/100.0)
  log('Heavy\t', toNumber(v[2]/p16)/100.0)
  log('Strike\t', toNumber(v[3]/p16)/100.0)
  log('Tech\t', toNumber(v[4]/p16)/100.0)
  log('Magic\t', toNumber(v[5]/p16)/100.0)
  log('Power\t', toNumber((v[5] + v[1] + v[2] + v[3] + v[4] )/p16)/100.0)
  log('CAT\t', v[6])

}


async function main() {

  let deployer, wThuan, wTest;
  [deployer, wThuan, wTest] = await ethers.getSigners();
  const ge = await loadContractFrom("GreenEnergy", TOKENS.ge)
  const storeGame = await loadContractFrom("StoreGame", TOKENS.storeGame)
  
  const kuni = await loadContractFrom("MiningKuni", TOKENS.kuni)
  const kuniItem = await loadContractFrom("KuniItem", TOKENS.kuniItem)
  const kuniSaru = await loadContractAt('KuniSaru', TOKENS.kuniSaru)
  const game     = await loadContractAt('AmaGame', TOKENS.amaGame)
  const ore      = await loadContractAt('Material', TOKENS.ore)
  const stone    = await loadContractAt('Material', TOKENS.stone)
  const cotton   = await loadContractAt('Material', TOKENS.cotton)
  const lumber   = await loadContractAt('Material', TOKENS.lumber)
  const amaInv   = await loadContractAt('AmaInv', TOKENS.amaInv)
  const referral = await loadContractAt('Referral', TOKENS.referral)
  const scholar  = await loadContractAt('Scholarship', TOKENS.scholarship)
  const ecoGame  = await loadContractAt('EcoGame', TOKENS.ecoGame)

  const metadata =  await loadContractAt('MetaData', TOKENS.metaData)

  // const amatsuOld = await loadContractAt("AmaGame", '0x01284F696C0b3eDd350Fab8c93A0B36001Cf0301')

  const cToken = {
    ore, stone, cotton, lumber
  }


  async function getTokenScholar(addr, acc) {
    const tokenIds = await scholar.valuesOf(addr, acc);
    return tokenIds
  }


  // step 1
  async function fighting(acc, tokenIds) {
    log(await game.unclaimedGE(acc.address)/p16)
    const tx = await game.connect(acc).fighting(tokenIds, [[0,0,0,0,0]])
    game.on("Fighting", async function(user, tokenIds, itemIds, ge, power, won) {
      log(`GE ${ge/p16} -- NiOH: ${power/p16} --- STATUS: ${won}`)
    })
    await tx.wait()
    log('stage', await game.stageOf(acc.address))
    await sleep(10000)
  }

  // step 2
  async function claimGE(acc) {
    (await game.connect(acc).claimGE()).wait()
    log('GE', (await ge.balanceOf(acc.address))/p16)
  }
  // step 3
  // mine kuni
  async function mineKuni(acc) {
    await approveToken(ge, acc, TOKENS.kuni)
    const tGE = await ge.balanceOf(acc.address)
      if (tGE > 0)
    (await kuni.connect(acc).mineKuni(TOKENS.ge, tGE)).wait()
    log('GE', tGE/p16)
    await sleep(3000)
  }

  // Step 2 & 3 <=> 

  // step 2 & 3
  async function earnKuni(acc) {
    const aGE = await game.unclaimedGE(acc.address)
    if (aGE > 0) {
      log('Earn....')
      await (await game.connect(acc).earnKuni()).wait()
      await sleep(500)
    }
    log('GE ', (await kuni.geStakedOf(TOKENS.ge, acc.address))/p16)
    await sleep(3000)
  }

  // step 4
  async function claimKuni(acc) {
    const aGE = await kuni.geStakedOf(TOKENS.ge, acc.address)
    if (aGE > 0) {
      log('claim....')
      await (await kuni.connect(acc).claimKuni(TOKENS.ge, aGE)).wait()
    }
    log('Kuni ', ( await kuni.balanceOf(acc.address) )/p16)
    await sleep(3000)
  }

  async function deposit(acc, tokenIds, amount) {
    await approveNft(kuniSaru, acc, TOKENS.amaGame)
    await approveToken(kuni, acc, TOKENS.amaGame)
    await (await game.connect(acc).deposit(amount, tokenIds)).wait()
    log('deposit', (await game.kuniStakedOf(acc.address))/p16)
  }
  async function claim(acc) {
    await sleep(1000)
    await (await game.connect(acc).claim()).wait()
    log('claim', (await cotton.balanceOf(acc.address))/p16)
  }

  async function withdraw(acc) {
    await sleep(1000)
    await (await game.connect(acc).withdraw()).wait()
    log('withdraw', (await ore.balanceOf(acc.address))/p16)
  }

  async function fnCraft(acc, tokens, amount, _type) {
    let i = 0;
    while (i < tokens.length) {
      await approveToken(cToken[tokens[i]], acc, TOKENS.amaInv)  
      i++;
      await sleep(200)
    }

    console.log(TOKENS.amaInv);
    const rs = await amaInv.connect(acc).craft(tokens.map(t => TOKENS[t]), amount.map(v => parseEther(`${v}`)), _type)
    // log(rs.hash)
    amaInv.on('Craft', async function(sender, tokenId) {
      await logKuniItemMeta(kuniItem, tokenId)
      await amaInv.removeListener('Craft')
    })
   
    await rs.wait()
    log(await amaInv.currentCapOf(acc.address))
    await sleep(10000)
  }
  // await fnCraft(wTest, ['stone', 'cotton'], ['12.41', '2.4'], 0)



  // const { tokenIds } = await getTokenIds(kuniSaru, wTest.address)
  // console.log(tokenIds);


  // await fighting(wTest, [139, 234], [[0,0,0,0,0]])
  // EARN
  // await claimGE(wTest)
  // await mineKuni(wTest)
  // await earnKuni(wTest)

  // await claimKuni(wTest)

  const mKuni = parseUnits('800', 0)//await kuni.balanceOf(wTest.address)
  // console.log(mKuni);

  // await deposit(wTest, [139], mKuni)
  
  
  // log(await kuniSaru.balanceOf(wTest.address))
  // log(await kuniItem.balanceOf(wTest.address))
  // await claim(wTest)
  // await withdraw(wTest)
  // log(await kuniSaru.ownerOf(139))
  // log('ore', (await ore.balanceOf(wTest.address))/p16)
  // log('stone', (await stone.balanceOf(wTest.address))/p16)
  // log('cotton', (await cotton.balanceOf(wTest.address))/p16)
  // log('lumber', (await lumber.balanceOf(wTest.address))/p16)
// ore , lumber
  

  // log(await kuniItem.totalSupply())

  // log(await kuniSaru.balanceOf(wTest.address))
  // log(await kuniSaru.balanceOf(TOKENS.amaGame))
  // const aTu = '0x57404C0B6592368D7f1367e7633919e212Db9286'
  // log(await amatsu.balanceOf(aTu))
  // log((await game.peddingReward(TOKENS.ore, aTu))/p16)
  // log(await game.unclaimedGE(wTest.address))
  // log(await kuni.geStakedOf(TOKENS.ge, wTest.address))
  
  // log(await kuniSaru.ownerOf(69))
  // log('wallet', aTu)
  // log('Saru', await kuniSaru.balanceOf(aTu))
  // log('item', await kuniItem.balanceOf(aTu))
  // log('scholarship')
  // log('Saru', await scholar.balanceOf(TOKENS.kuniSaru, aTu))
  // log('item', await scholar.balanceOf(TOKENS.kuniItem, aTu))
  // log('game staked')
  // log('Saru', await amatsu.balanceOf(aTu))
  // log(await getTokenScholar(TOKENS.kuniSaru, wTest.address))
  // log((await game.unclaimedGE(wTest.address))/p16)
  // log(await game.stageOf(wTest.address))
  // await (await storeGame.updateGame(TOKENS.amaGame, TOKENS.amaInv)).wait()
  // log(await storeGame.playInfo(wTest.address))

  const p = ethers.parseUnits('1', 17);

  async function peddingReward(addr) {
    log('wallet', addr)
    log('ore', await game.peddingReward(TOKENS.ore, addr)/p)
    log('stone', await game.peddingReward(TOKENS.stone, addr)/p)
    log('cotton', await game.peddingReward(TOKENS.cotton, addr)/p)
    log('lumber', await game.peddingReward(TOKENS.lumber, addr)/p)
  }

  // await peddingReward(wATU)
  // await peddingReward(wTest.address)



  async function myUserInfo(addr) {
    log('\n------myUserInfo---------\nWallet', addr)
    log('ore', (await game.userInfo(TOKENS.ore, addr)).amount)
    log('stone', (await game.userInfo(TOKENS.stone, addr)).amount)
    log('cotton', (await game.userInfo(TOKENS.cotton, addr)).amount)
    log('lumber', (await game.userInfo(TOKENS.lumber, addr)).amount)
  }

  // await myUserInfo('0x57404C0B6592368D7f1367e7633919e212Db9286')
  
  // await myUserInfo(wTest.address)
  

  async function poolInfo() {
    // log('wallet', addr)
    log('ore', (await game.pools(TOKENS.ore)).supply)
    log('stone', (await game.pools(TOKENS.stone)).supply)
    log('stone', (await game.pools(TOKENS.stone)).supply)
    log('lumber', (await game.pools(TOKENS.lumber)).supply)
  }

  // await poolInfo()

  // log((await game.kuniStakedOf(wATU)))

  // log(await storeGame.playInfo(wTest.address))
  // let t = 0n;
  // for (let index = 0; index < meta.length - 1; index++) {
  //   if (index === 0) continue
  //   log(meta[index]/p16)
  //   t += meta[index]
  // }
  // log('power', t/p16)

  // log('ore\t', await amaInv.materialPic(TOKENS.ore))
  // log('stone\t', await amaInv.materialPic(TOKENS.stone))
  // log('cotton\t', await amaInv.materialPic(TOKENS.cotton))
  // log('lumber\t', await amaInv.materialPic(TOKENS.lumber))

  async function logMeta(inx) {
    log('------------')
    log('lumber\t', (await metadata.materials(4, inx))/p16)
    log('stone\t', (await metadata.materials(2, inx))/p16)
    log('ore\t', (await metadata.materials(1, inx))/p16)
    log('cotton\t', (await metadata.materials(3, inx))/p16)
    
  }

  // logKuniItemMeta(kuniItem, 20)

  // await logMeta(0)
  // await logMeta(1)
  // await logMeta(2)
  // await logMeta(3)
  // await logMeta(4)

  // await ecoGame.materialStasBatch([])

  

  // log((await scholar.valuesOf(TOKENS.kuniSaru, "0x1F71e6b0bc853Ca7C51F7AEe8A16a4afb2452Ab0")).map(t => toNumber(t)))
  log(await kuni.geStakedOf(TOKENS.ge, '0x8774c77f615A4cb2A51f908dD66FFF49bC7e3a32'))


  // materials

}

main().catch(err => log(err)).then(() => log('=======-----SUCCESS-----======='))