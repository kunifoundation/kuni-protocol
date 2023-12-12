const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const {initPowerEffData, initCraftData, initSaruData} = require("../js-commons/ama-data");
const mainTest = require("./00.deploy.test");

const {deployContract, getContractFactory} = ethers;

const log = console.log;

const IS_TESTNET = true;

const FOUNDATION_ADDR = "0xD0eE5b7b9eB03eD630BdFcfb9A5b656773139C55";
const GENESIS_TIME = 1704250800; // 2024-01-03 10:00:00 GMT+07:00
const REF_ROOT = "AMAKUNI";
const KUNI_SARU_ADDR = "0x5fa891e95c948288A376C92fbd3AFc83D488d5a8";
const META_ITEM_URL = "https://api.amakuni.com/api/kuni-item/";

async function main() {
    let deployer, alex, bob, wFounder;
    let foundation = FOUNDATION_ADDR;
    let refRoot = REF_ROOT;
    let TOKENS = {kuniSaru: KUNI_SARU_ADDR};
    let metaItemURL = META_ITEM_URL;
    let genesisTime = GENESIS_TIME;
    [deployer, alex, bob, wFounder, ...addrs] = await ethers.getSigners();

    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    let nonce = await ethers.provider.getTransactionCount(deployer.address);

    log(" ======= DEPLOY..... ========\n");
    log("DEPLOY COMMON...");
    if (IS_TESTNET) {
        genesisTime = 0;
        foundation = wFounder.address;
        metaItemURL = "https://apitestnet.amakuni.com/api/kuni-item/"
        this.saru = await (await deployContract("KuniSaru")).waitForDeployment({nonce: ++nonce});
        TOKENS.kuniSaru = await this.saru.getAddress();
    } else {
        this.saru = (await (getContractFactory("KuniSaru"))).attach(TOKENS.kuniSaru)
    }
    
    log("1. KuniSaru: ", TOKENS.kuniSaru);
    this.referral = await (await deployContract("Referral", [foundation, refRoot])).waitForDeployment({nonce: ++nonce});
    TOKENS.referral = await this.referral.getAddress();
    log("2. Referral: ", TOKENS.referral);

    this.meta = await (await deployContract("MetaData")).waitForDeployment({nonce: ++nonce});
    TOKENS.metaData = await this.meta.getAddress();
    log("3. MetaData: ", TOKENS.metaData);

    this.eco = await (await deployContract("EcoGame", [TOKENS.metaData])).waitForDeployment({nonce: ++nonce});
    TOKENS.ecoGame = await this.eco.getAddress();
    log("4. EcoGame: ", TOKENS.ecoGame);
    this.scholarship = await (await deployContract("Scholarship")).waitForDeployment({nonce: ++nonce});
    TOKENS.scholarship = await this.scholarship.getAddress();
    log("5. Scholarship: ", TOKENS.scholarship);

    log("\nDEPLOY TOKENS.....");
    this.ge = await (await deployContract("GreenEnergy")).waitForDeployment({nonce: ++nonce});
    TOKENS.ge = await this.ge.getAddress();
    log("6. GreenEnergy: ", TOKENS.ge);

    this.mining = await (await deployContract("MiningKuni")).waitForDeployment({nonce: ++nonce});
    TOKENS.kuni = await this.mining.getAddress();
    log("7. MiningKuni: ", TOKENS.kuni);

    this.ore = await (await deployContract("Material", ["Ore", "ORE"])).waitForDeployment({nonce: ++nonce});
    TOKENS.ore = await this.ore.getAddress();
    log("8. Ore: ", TOKENS.ore);

    this.stone = await (await deployContract("Material", ["Stone", "STONE"])).waitForDeployment({nonce: ++nonce});
    TOKENS.stone = await this.stone.getAddress();
    log("9. Stone: ", TOKENS.stone);

    this.cotton = await (await deployContract("Material", ["Cotton", "COTTON"])).waitForDeployment({nonce: ++nonce});
    TOKENS.cotton = await this.cotton.getAddress();
    log("10. Cotton: ", TOKENS.cotton);

    this.lumber = await (await deployContract("Material", ["Lumber", "LUMBER"])).waitForDeployment({nonce: ++nonce});
    TOKENS.lumber = await this.lumber.getAddress();
    log("11. Lumber: ", TOKENS.lumber);

    log("\nDEPLOY TOKEN KUNI ITEM.....");
    this.kuniItem = await (await deployContract("KuniItem")).waitForDeployment({nonce: ++nonce});
    TOKENS.kuniItem = await this.kuniItem.getAddress();
    log("12. kuniItem: ", TOKENS.kuniItem);

    log("DEPLOY TOKEN AmaInv.....");
    this.inv = await (await deployContract("AmaInv", [TOKENS.kuni, TOKENS.ecoGame, TOKENS.kuniItem])).waitForDeployment({nonce: ++nonce});
    TOKENS.amaInv = await this.inv.getAddress();
    log("13. AmaInv: ", TOKENS.amaInv);

    log("\nDEPLOY CORE GAME.....");
    this.game = await (
        await deployContract("AmaGame", [genesisTime, TOKENS.kuni, TOKENS.kuniSaru, TOKENS.kuniItem, TOKENS.ecoGame, TOKENS.scholarship, TOKENS.referral, TOKENS.ge, foundation])
    ).waitForDeployment({nonce: ++nonce});
    TOKENS.amaGame = await this.game.getAddress();
    log("14. amaGame: ", TOKENS.amaGame);

    this.storeGame = await (await deployContract("StoreGame")).waitForDeployment({nonce: ++nonce});
    TOKENS.storeGame = await this.storeGame.getAddress();
    log("15. storeGame: ", TOKENS.storeGame);

    log("\n=========== TOKEN DEPLOYED! ===========\n\n=========== CONFIG GAME =========== ");

    log("01. Config game....");
    await (await this.game.setMaterials([TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber], {nonce: nonce})).wait();
    log("02. Config kuni mining....");
    await (await this.mining.addPool(TOKENS.ge, [TOKENS.amaGame, TOKENS.amaInv], {nonce: ++nonce})).wait();
    await (await this.mining.addCoreGame(TOKENS.amaGame, {nonce: ++nonce})).wait();
    log("03. Config kuni inv...");
    await (await this.inv.setMaterialPic([TOKENS.ore, TOKENS.stone, TOKENS.cotton, TOKENS.lumber], [1, 2, 3, 4], {nonce: ++nonce})).wait();
    log("04. Config kuni item...");
    await (await this.kuniItem.setMinter(TOKENS.amaInv, {nonce: ++nonce})).wait();
    await (await kuniItem.setBaseUrl(metaItemURL, {nonce: ++nonce})).wait();
    log("05. Config minter for token...");
    await (await this.ore.setMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await this.stone.setMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await this.cotton.setMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await this.lumber.setMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();
    await (await this.ge.setMinter(TOKENS.amaGame, {nonce: ++nonce})).wait();

    log("06. ========== INIT DATA =========");
    log("- Init power eff");
    await initPowerEffData(this.meta);
    log("- Init craft");
    await initCraftData(this.meta);
    // 1 - 10
    log("- Init saru props: 10000 SARU");
    const self = this;
    async function initSaru(start) {
        const limit = 125;
        const st = start * limit;
        await initSaruData(self.meta, start * limit, ++start * limit);
        if (!IS_TESTNET) {
            await initSaruData(self.meta, start * limit, ++start * limit);
            await initSaruData(self.meta, start * limit, ++start * limit);
            await initSaruData(self.meta, start * limit, ++start * limit);
            await initSaruData(self.meta, start * limit, ++start * limit);
            await initSaruData(self.meta, start * limit, ++start * limit);
            await initSaruData(self.meta, start * limit, ++start * limit);
            await initSaruData(self.meta, start * limit, ++start * limit);
        }
        log(`Saru init ${st} => ${start * limit}`);
        return start;
    }

    let start = 0;
    start = await initSaru(start);
    if (!IS_TESTNET) {
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
        start = await initSaru(start);
    }

    log("\n=========== TRANSFER OWNERSHIP ===========\n")
    nonce = await ethers.provider.getTransactionCount(deployer.address);
    this.eco.transferOwnership(foundation, {nonce: nonce++})
    this.meta.transferOwnership(foundation, {nonce: nonce++})
    this.storeGame.transferOwnership(foundation, {nonce: nonce++})

    this.game.transferOwnership(foundation, {nonce: nonce++})
    this.inv.transferOwnership(foundation, {nonce: nonce++})
    this.mining.transferOwnership(foundation, {nonce: nonce++})
    this.referral.transferOwnership(foundation, {nonce: nonce++})
    this.scholarship.transferOwnership(foundation, {nonce: nonce++})

    this.ore.transferOwnership(foundation, {nonce: nonce++})
    this.cotton.transferOwnership(foundation, {nonce: nonce++})
    this.stone.transferOwnership(foundation, {nonce: nonce++})
    this.lumber.transferOwnership(foundation, {nonce: nonce++})
    this.ge.transferOwnership(foundation, {nonce: nonce++})
    this.kuniItem.transferOwnership(foundation, {nonce: nonce++})

    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "ETH");

    writeWithToken(TOKENS, __filename, 1, "json");
    if (IS_TESTNET) {
        await mainTest({
            ACC: {alex, bob, wFounder, deployer},
            TOKENS,
            foundation,
            REF_ROOT: refRoot,
            ...this,
        });
    }
}

main()
    .catch((err) => log(err))
    .then(() => log("========= DEPLOYED! ========="));
