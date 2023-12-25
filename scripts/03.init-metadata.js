const {ethers} = require("hardhat");
const loadContract = require('./attach-contract')
const {initPowerEffData, initCraftData, initSaruData} = require("../js-commons/ama-data");
const { IS_TESTNET } = require('./00.load-env')

const log = console.log;

async function main() {
    log("\n========== INIT DATA =========");
    const [deployer] = await ethers.getSigners();
    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    console.log(ethers.formatEther(BALANCE_START));
    // return;
    const core = await loadContract()
    // await initSaruData(core.meta, 5900, 6001);
    // await initSaruData(core.meta, 6999, 7000);
    // log("- Init power eff");
    // await initPowerEffData(core.meta);  
    // log("- Init craft");
    // await initCraftData(core.meta);
    // // 1 - 10
    // log("- Init saru props: 10000 SARU");
    // async function initSaru(start) {
    //     const limit = 125;
    //     const st = start * limit;
    //     await initSaruData(core.meta, start * limit, ++start * limit);
    //     if (!IS_TESTNET) {
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //         await initSaruData(core.meta, start * limit, ++start * limit);
    //     }
    //     log(`Saru init ${st} => ${start * limit}`);
    //     return start;
    // }

    // let start = 0;
    // start = await initSaru(start);
    // if (!IS_TESTNET) {
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    //     start = await initSaru(start);
    // }
    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "ETH");
}

if (!IS_TESTNET)
    main()
        .catch((err) => log(err))
        .then(() => log("========= METADATA INITIALIZED ========="));

module.exports.initMetaData = main;
