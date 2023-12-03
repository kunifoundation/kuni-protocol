const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const game = require("./_v4/core-game");
const log = console.log;

async function main() {
    log("deploy.....");
    this.ge = await (await ethers.deployContract("GreenEnergy")).waitForDeployment();
    this.mining = await (await ethers.deployContract("MiningKuni")).waitForDeployment();
    writeWithToken(
        {
            ge: await this.ge.getAddress(),
            kuni: await this.mining.getAddress(),
        },
        __filename,
        1,
    );
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
