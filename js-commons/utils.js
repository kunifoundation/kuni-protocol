const fs = require('fs');
const _ = require('lodash')
const ethers = require('ethers');
const { toUtf8Bytes, parseEther, parseUnits, keccak256, toBigInt } = ethers
// const {utils} = ethers

const log = console.log

async function sleep(seconds) {
  const b1 = await ethers.provider.getBlockNumber();
  await ethers.provider.send('evm_increaseTime', [seconds]);
  await ethers.provider.send('evm_mine');
  const b2 = await ethers.provider.getBlockNumber();
}

function _readdata(_path, _symbol='\r') {
  let data = fs.readFileSync(_path, {encoding: 'utf-8'})
  data = data.toString().split(_symbol)
  data = data.slice(1)
  return data
}

async function _nftAdd(game, nfts, min, max) {
  let proSaru = [] 
  const _jjKuni = nfts.slice(min, max)
  _jjKuni.map(item => {
    const vals = item.split(',');
      // uint256 hand, uint256 weapon, uint256 head, uint256 eyes, uint256 body, uint256 hair
    return game.addNft(
      Number(vals[0]),
      keccak256(toUtf8Bytes(vals[2].toLowerCase())),
      keccak256(toUtf8Bytes(vals[3].toLowerCase())),
      keccak256(toUtf8Bytes(vals[4].toLowerCase())),
      keccak256(toUtf8Bytes(vals[5].toLowerCase())),
      keccak256(toUtf8Bytes(vals[6].toLowerCase())),
      keccak256(toUtf8Bytes(vals[7].toLowerCase())),
    )
  })
  
  await Promise.all(proSaru)
}

function toByteByName(name) {
  name = name.toLowerCase()
  return keccak256(toUtf8Bytes(name))
}

module.exports.toByteByName = toByteByName

module.exports.fnToBatchProp = (data) => {
  let props = {
    keys: [],
    vals: []
  }
  data.forEach(element => {
    const vals = element.split(';')
    // Name;SLASH;HEAVY;STRIKE;TECH;MAGIC
    props.keys.push(keccak256(toUtf8Bytes(vals[0].toLowerCase())))
    props.vals.push([
      parseEther(vals[1] || '0'),
      parseEther(vals[2] || '0'),
      parseEther(vals[3] || '0'),
      parseEther(vals[4] || '0'),
      parseEther(vals[5] || '0')
    ])
  });

  return props
}


module.exports.fnToPowers = (data, pVal) => {
  const results = {keys: [], vals: []}
  const dic = {}
  _.forEach(pVal.keys, (k, inx) => {
    dic[k] = pVal.vals[inx]
  })
  data.forEach(el => {
    const vals = el.split(';')
    const k = parseEther(`${vals[15]}` || '0')
    const key = keccak256(toUtf8Bytes(vals[0].toLowerCase()))
    const total = k * toBigInt(10000) / toBigInt(vals[1]|| '0')
    results.keys.push(key)
    const val = [...dic[key].map(it => it * (total) / (parseEther('1'))), vals[16] == '1' ? 1 : 0]
    results.vals.push(val)
  });
  return results
}


module.exports.fnToBatchStats = (data) => {
  return data.map(item => {
    const vals = item.split(';')
    if (vals[0] === 'Cotton White') {
      // log(parseEther(vals[1] || '0'),
      // parseEther(vals[15] || '0'),
      // vals[16] == '1' ? 0 : 1, vals[1], vals[15])
    }
    return [
      keccak256(toUtf8Bytes(vals[0].toLowerCase())),
      parseEther(vals[1] || '0'),
      parseEther(vals[15] || '0'),
      vals[16] == '1' ? 1 : 0
    ]
  })
}

module.exports.fnContinental = (tokensObj, data) => {
  const tokens = data.map(item => tokensObj[item.split(';')[0]])
  const props = data.map(item => {
    const vals = item.split(';')
    return [
      parseUnits(vals[1] || '0', 12),
      parseUnits(vals[2] || '0', 12),
      parseUnits(vals[3] || '0', 12),
      parseUnits(vals[4] || '0', 12),
      parseUnits(vals[5] || '0', 12),
    ]
  })

  return {keys: tokens, vals:  props}
}

// ore; stone; cotton; lumber
module.exports.fnMaterialPropBatch = (tokensObj, data) => {
  const tokens = data.map(item => tokensObj[item.split(';')[0]])
  const props = data.map(item => {
    const vals = item.split(';')
    return [
      parseEther(vals[1] || '0'),
      parseEther(vals[2] || '0'),
      parseEther(vals[3] || '0'),
      parseEther(vals[4] || '0'),
      parseEther(vals[5] || '0'),
    ]
  })
  return {keys: tokens, vals:  props}
}


module.exports.fnCraftInfo = (data) => {
  const names = data.map(item => item.split(';')[0])
  const props = data.map(item => {
    const vals = item.split(';')
    return [
      parseUnits(`${vals[2]}`, 0),
      parseUnits(vals[1] || '0', 0),
    ]
  })
  return {names, props}
}

module.exports.fnToBatchNft = (data, min, max) => {
  return data.slice(min, max).map(item => {
    const vals = item.split(',');
      // uint256 hand, uint256 weapon, uint256 head, uint256 eyes, uint256 body, uint256 hair
    return [
      parseInt(vals[0]),
      keccak256(toUtf8Bytes(vals[2].toLowerCase())),
      keccak256(toUtf8Bytes(vals[3].toLowerCase())),
      keccak256(toUtf8Bytes(vals[4].toLowerCase())),
      keccak256(toUtf8Bytes(vals[5].toLowerCase())),
      keccak256(toUtf8Bytes(vals[6].toLowerCase())),
      keccak256(toUtf8Bytes(vals[7].toLowerCase())),
    ]
  })
}


module.exports.fnToBatchNftV2 = (data, min, max) => {
  const tokenIds = []
  const props = []
  data.slice(min, max).forEach(item => {
    const vals = item.split(',');
      // uint256 hand, uint256 weapon, uint256 head, uint256 eyes, uint256 body, uint256 hair

    tokenIds.push(Number(vals[0]))
    props.push([
      toByteByName(vals[2]),
      toByteByName(vals[3]),
      toByteByName(vals[4]),
      toByteByName(vals[5]),
      toByteByName(vals[6]),
      toByteByName(vals[7]),
    ])
  })

  return {keys: tokenIds, vals: props}

}

module.exports.printObject = (prop) => {
  for (const key in prop) {
    if (Object.hasOwnProperty.call(prop, key)) {
      if (key == 'name') {
        continue
      }
      if (!isNaN(parseInt(key)) || key === 'attack') {
        continue
      }
      log(key, parseEther(prop[key]))  
    }
  }
}

module.exports.toTokens = data => {
  let rs = 'module.exports = {\n'
  for(const key in data) {
    rs += `\t${key}: '${data[key]}',\n`
  }
  return `${rs}\n}`
}

module.exports.writeToken = (data, filePath) => {
  fs.writeFileSync(filePath, data, { encoding: 'utf-8' })
}


module.exports.fnReadFile = _readdata
module.exports.fnAddNFT = _nftAdd
 
async function cMintNft(self, to, k) {
  if (k === 0) return
  let tx;
  tx = await self.kuniSaru.connect(self.ow).safeMint(to)
  await tx.wait()
  if (k > 1) {
    tx = await self.kuniSaru.connect(self.ow).safeMint(to)
    await tx.wait()
  }
  if (k > 2) {
    tx = await self.kuniSaru.connect(self.ow).safeMint(to)
    await tx.wait()
  }
  if (k > 3) {
    tx = await self.kuniSaru.connect(self.ow).safeMint(to)
    await tx.wait()
  }
  if (k > 4) {
    tx = await self.kuniSaru.connect(self.ow).safeMint(to)
    await tx.wait()
  }
}

module.exports.cInitData = async function(self, user, amountKuni, amountSaru) {
  let tx;
  if (amountKuni > 0) {
    tx = await self.kuni.connect(self.ow).mint(user.address, amountKuni)
    await tx.wait()
    tx = await self.kuni.connect(user).approve(self.amatsu.address, ethers.constants.MaxUint256);
    await tx.wait()
  }
  
  await cMintNft(self, user.address, amountSaru)
  tx = await self.kuniSaru.connect(user).setApprovalForAll(self.amatsu.address, true);
  await tx.wait()
}

module.exports.cMintNft = cMintNft

module.exports.addMaterialRole = async function (self, token) {
  let tx;
  const MINTER = await self[token].MINTER_ROLE()
  const BURNER = await self[token].BURNER_ROLE()
  tx = await self[token].connect(self.ow).grantRole(BURNER, self.amatsu.address) // craft
  await tx.wait()
  tx = await self[token].connect(self.ow).grantRole(MINTER, self.amatsu.address)
  await tx.wait()
  tx = await self.kuniVault.connect(self.ow).setApproveBatch([self[token].address])
  await tx.wait()
  tx = await self[token].connect(self.ow).grantRole(MINTER, self.kuniVault.address)
  await tx.wait()

  // await self[token].grantRole(MINTER, self.ow.address)
}