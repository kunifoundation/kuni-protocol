const {ethers} = require("hardhat");
const TOKENS = require("./_v4");
const {initPowerEffData, initCraftData, initSaruData} = require("../js-commons/ama-data");
const abis = require("./abis");

const log = console.log;

const wFourder = "0x42BB69d0B95F631cDA87859fF798cE192960b340";

async function loadContractAt(abi, address, signer) {
    const c = await ethers.getContractAt(abi, address, signer);
    return c;
}

async function loadContractFrom(addr, cName) {
    const contract = await ethers.getContractFactory(cName);
    return contract.attach(addr);
}

async function setMiningKuni() {
    this.mining = await loadContractFrom(TOKENS.kuni, "MiningKuni");
    await (await this.mining.addPool(TOKENS.ge, [TOKENS.amaGame, TOKENS.amaInv])).wait();
    // await (await this.mining.addCoreGame(TOKENS.amaGame)).wait()
    log("set pool mining");
}

async function coreGame() {
    log("CORE GAME");
    this.game = await loadContractFrom(TOKENS.amaGame, "AmaGame");
    log(await this.game.kuniItem());
    // await (await this.game.setGE(TOKENS.ge)).wait()
    // log('GE DONE')
    // await (await this.game.setMining(TOKENS.kuni)).wait()
    // await (await this.game.setFoundation(wFourder)).wait()
    // await (await this.game.setMaterials([TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber])).wait()

    // log('======== setup minter =========== ')
    // await (await (await loadContractFrom(TOKENS.ore,    'Material')).setMinter(TOKENS.amaGame)).wait()
    // await (await (await loadContractFrom(TOKENS.stone,  'Material')).setMinter(TOKENS.amaGame)).wait()
    // await (await (await loadContractFrom(TOKENS.cotton, 'Material')).setMinter(TOKENS.amaGame)).wait()
    // await (await (await loadContractFrom(TOKENS.lumber, 'Material')).setMinter(TOKENS.amaGame)).wait()
    // await (await (await loadContractFrom(TOKENS.lumber, 'Material')).setMinter(TOKENS.amaGame)).wait()
    // await (await (await loadContractFrom(TOKENS.ge,     'GreenEnergy')).setMinter(TOKENS.amaGame)).wait()
    log("minter done!");
}

async function invGame() {
    log("INV GAME");
    this.inv = await loadContractFrom(TOKENS.amaInv, "AmaInv");
    // let tx = await this.inv.setMaterialPic([
    //   TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber
    // ], [1,2,3,4])
    // await tx.wait()

    await (await this.inv.setMining(ethers.ZeroAddress)).wait();
    // await (await this.inv.setKuniItem(TOKENS.kuniItem)).wait()
    log("inv done!");
}

async function updateEco() {
    this.inv = await loadContractFrom(TOKENS.amaInv, "AmaInv");
    await (await this.inv.setEco(TOKENS.ecoGame)).wait();

    this.amagame = await loadContractFrom(TOKENS.amaInv, "AmaGame");
    await (await this.amagame.setEco(TOKENS.ecoGame)).wait();
}

async function initData() {
    this.meta = await loadContractFrom(TOKENS.metaData, "MetaData");
    // await initPowerEffData(this.meta)
    // log('init power eff');
    // await initCraftData(this.meta)
    // log('init craft')
    // 1 - 10
    await initSaruData(this.meta, 800, 1000);
}

async function createCodeRef() {
    const referral = await loadContractAt(
        "Referral",
        TOKENS.referral,
    )(await referral.createCodeTo(wFourder, "AMAKUNI", 5000)).wait();
}

async function setOldItemRole() {
    const [owner] = await ethers.getSigners();
    const contract = new ethers.Contract(TOKENS.kuniItem, abis.oldItem, owner);
    await (await contract.grantRole(await contract.MINTER_ROLE(), TOKENS.amaInv)).wait();
}

async function setupKuniItem() {
    const kuniItemToken = TOKENS.kuniItem;
    const kuniItem = await loadContractFrom(kuniItemToken, "KuniItem");
    // const inv = await loadContractFrom(TOKENS.amaInv, 'AmaInv')
    // const game = await loadContractFrom(TOKENS.amaGame, 'AmaGame')
    // await (await kuniItem.setMinter(TOKENS.amaInv)).wait()
    // await (await inv.setKuniItem(kuniItemToken)).wait()
    // await (await game.setItem(kuniItemToken)).wait()

    // https://apitestnet.amakuni.com/api/kuni-item

    await (await kuniItem.setBaseUrl("https://apitestnet.amakuni.com/api/kuni-item/")).wait();
}

async function main() {
    // await setMiningKuni();
    // await coreGame()
    // await invGame()
    // await createCodeRef()
    // await initData()
    // await updateEco()
    // await setOldItemRole()
    await setupKuniItem();
}

main()
    .catch((err) => log(err))
    .then(() => log("=======-----SUCCESS-----======="));
