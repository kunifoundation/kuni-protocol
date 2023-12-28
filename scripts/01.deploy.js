const {ethers} = require("hardhat");
const { 
    FOUNDATION_ADDR, REF_ROOT, KUNI_SARU_ADDR, GENESIS_TIME 
} = require('./00.load-env')

const {writeWithToken} = require("../js-commons/io");


const {deployContract, getContractFactory} = ethers;

const log = console.log;
async function main() {
    let foundation = FOUNDATION_ADDR;
    let refRoot = REF_ROOT;
    let TOKENS = {kuniSaru: KUNI_SARU_ADDR};
    let genesisTime = GENESIS_TIME;
    const [deployer, ...addrs] = await ethers.getSigners();

    const BALANCE_START = await ethers.provider.getBalance(deployer.address);
    let nonce = await ethers.provider.getTransactionCount(deployer.address);

    log(`======= DEPLOY..... ========\n`);
    log("DEPLOY COMMON...");
    this.saru = (await (getContractFactory("KuniSaru"))).attach(TOKENS.kuniSaru)
    log('FOUNDATION ADDRESS: ', foundation)
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

    log("\nDEPLOY TOKEN AmaInv.....");
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

    log("\n=========== TOKEN DEPLOYED! ===========\n");

    log("Balance Fee: ", ethers.formatEther(BALANCE_START - (await ethers.provider.getBalance(deployer.address))), "BNB");
    writeWithToken(TOKENS, "contract.js", 0, "json");
}

main()
    .catch((err) => log(err))
    .then(() => log("========= DEPLOYED! ========="));
