const {ethers} = require("hardhat");
const loadContract = require('./attach-contract')
const {initPowerEffData, initCraftData, initSaruData} = require("../js-commons/ama-data");

const log = console.log;

async function main() {
    log("\n========== INIT DATA =========");
    const [deployer] = await ethers.getSigners();
    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    console.log(ethers.formatEther(BALANCE_START));
    // return;
    const core = await loadContract()
    log("- Init power eff");
    await initPowerEffData(core.meta);  
    log("- Init craft");
    await initCraftData(core.meta);
    // 1 - 10
    log("- Init saru props: 10000 SARU");
    async function initSaru(start) {
        const limit = 125;
        const st = start * limit;
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        await initSaruData(core.meta, start * limit, ++start * limit);
        log(`Saru init ${st} => ${start * limit}`);
        return start;
    }

    let start = 0;
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    start = await initSaru(start);
    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "BNB");
}

main()
    .catch((err) => log(err))
    .then(() => log("========= METADATA INITIALIZED ========="));
