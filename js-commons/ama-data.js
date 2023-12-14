const { fnReadFile, fnToBatchProp, toByteByName, fnToPowers, fnToBatchNftV2, fnMaterialPropBatch, fnCraftInfo, fnContinental } = require('./utils')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fnDataFile() {
  let data = {}
  data.props       = fnReadFile('./kuni-data/props.csv', '\r\n')
  data.stats          = fnReadFile('./kuni-data/stats.csv', '\r\n')
  data.kuniSaruData   = fnReadFile('./kuni-data/KUNI_SARU.csv', '\n')
  data.materialProps  = fnReadFile('./kuni-data/material_stats.csv', '\n')
  data.craftInfo      = fnReadFile('./kuni-data/craft-info.csv', '\n')
  return data
}

function fnToBatchData(min, max) {
  const data = fnDataFile()
  const rs = {}
  rs.props = fnToBatchProp(data.props)
  rs.stats = fnToPowers(data.stats, rs.props)
  rs.saruData = fnToBatchNftV2(data.kuniSaruData, min, max)
  // ore; stone; cotton; lumber
  rs.materialProps = fnMaterialPropBatch({
    ore: 1,
    stone: 2,
    cotton: 3,
    lumber: 4
  }, data.materialProps)
  
  rs.craftInfo = fnCraftInfo(data.craftInfo)
  return rs
}
module.exports.fnToBatchData = fnToBatchData
module.exports.toByteByName = toByteByName

// Power & Eff
module.exports.initPowerEffData = async function(cMetadata) {
  let data = {
    props: fnReadFile('./kuni-data/props.csv', '\r\n'),
    stats: fnReadFile('./kuni-data/stats.csv', '\r\n')
  }

  const props = fnToBatchProp(data.props)
  const stats = fnToPowers(data.stats, props)
    // Props materials
  let tx = await cMetadata.addEfficiencyBatch(props.keys, props.vals)
  await tx.wait()
  
  // Power
  tx = await cMetadata.addPowerBatch(stats.keys, stats.vals)
  await tx.wait()
}

// Saru info
module.exports.initSaruData = async function(cMetadata, min, max, isLog=true) {
  const kuniSaruData = fnReadFile('./kuni-data/KUNI_SARU.csv', '\n')
  const saruData = fnToBatchNftV2(kuniSaruData, min, max)
  await (await cMetadata.addNftBatch(saruData.keys, saruData.vals)).wait()
  if (isLog)
    console.log(`Saru Index: ${min} => ${max}`)
}


// Craft
module.exports.initCraftData = async function(cMetadata) {
  let data = {
    props: fnReadFile('./kuni-data/material_stats.csv', '\n'),
    craft: fnReadFile('./kuni-data/craft-info.csv', '\n'),
    continental: fnReadFile('./kuni-data/continental.csv', '\n')
  }

  const props = fnMaterialPropBatch({ ore: 1, stone: 2, cotton: 3, lumber: 4 }, data.props)
  const continental = fnContinental({ Adimeke: 1, Threara: 2, Vorgaicy: 3, Fism: 4 }, data.continental)
  
// Wood, lumber
// Fiber, cotton

  const craftInfo = fnCraftInfo(data.craft)
    // Props materials
  await (await cMetadata.addMaterials(props.keys, props.vals)).wait()

  // craft
  await (await cMetadata.addItemCraft(craftInfo.names, craftInfo.props)).wait()

  // Continental Multiplier
  await (await cMetadata.addContinentalMulBatch(continental.keys, continental.vals)).wait()
}

async function cMintNft(kuniSaru, to, k) {
  if (k === 0) return
  let tx;
  while (k>0) {
    await sleep(100)
    await (await kuniSaru.safeMint(to)).wait()
    await sleep(500)
    k--
  }
}

module.exports.cMintNft = cMintNft