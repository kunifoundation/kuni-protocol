const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const nft = require("./_v4/nft");
const cm = require("./_v4/commons");
const {scholarship} = require("./_v4/scholarship");
const log = console.log;

async function main() {
    log("deploy.....");
    this.amaGame = await (
        await ethers.deployContract("AmaGame", [0, nft.kuniSaru, nft.kuniItem, cm.ecoGame, scholarship, cm.referral])
    ).waitForDeployment();

    writeWithToken(
        {
            amaGame: await this.amaGame.getAddress(),
        },
        __filename,
        1,
    );
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
