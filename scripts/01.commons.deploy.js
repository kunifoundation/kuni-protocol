const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const TOKENS = require("./_v4/commons");
const log = console.log;

async function main() {
    log("deploy.....");
    this.referral = await (await ethers.deployContract("Referral")).waitForDeployment();
    this.meta = await (await ethers.deployContract("MetaData")).waitForDeployment();
    this.eco = await (await ethers.deployContract("EcoGame", [await this.meta.getAddress()])).waitForDeployment();
    // this.eco      = await (await ethers.deployContract('EcoGame', [TOKENS.metaData])).waitForDeployment()

    writeWithToken(
        {
            ...TOKENS,
            // wFounder: await this.wFounder.getAddress(),
            metaData: await this.meta.getAddress(),
            ecoGame: await this.eco.getAddress(),
            referral: await this.referral.getAddress(),
        },
        __filename,
        1,
    );
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
