const loadContract = require('./attach-contract')
const {initPowerEffData, initCraftData, initSaruData} = require("../js-commons/ama-data");
const { IS_TESTNET } = require('./00.load-env')

const log = console.log;

async function main() {
    log("\n========== INIT DATA =========");
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
        if (!IS_TESTNET) {
            await initSaruData(core.meta, start * limit, ++start * limit);
            await initSaruData(core.meta, start * limit, ++start * limit);
            await initSaruData(core.meta, start * limit, ++start * limit);
            await initSaruData(core.meta, start * limit, ++start * limit);
            await initSaruData(core.meta, start * limit, ++start * limit);
            await initSaruData(core.meta, start * limit, ++start * limit);
            await initSaruData(core.meta, start * limit, ++start * limit);
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
}

if (!IS_TESTNET)
    main()
        .catch((err) => log(err))
        .then(() => log("========= METADATA INITIALIZED ========="));

module.exports.initMetaData = main;
