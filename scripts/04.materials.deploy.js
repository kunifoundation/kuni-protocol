const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const tokens = require("./_v4/core-game");

const log = console.log;

async function main() {
    log("deploy.....");
    this.ore = await (await ethers.deployContract("Material", ["Ore", "ORE"])).waitForDeployment();
    this.stone = await (await ethers.deployContract("Material", ["Stone", "STONE"])).waitForDeployment();
    this.cotton = await (await ethers.deployContract("Material", ["Cotton", "COTTON"])).waitForDeployment();
    this.lumber = await (await ethers.deployContract("Material", ["Lumber", "LUMBER"])).waitForDeployment();

    writeWithToken(
        {
            ore: await this.ore.getAddress(),
            stone: await this.stone.getAddress(),
            cotton: await this.cotton.getAddress(),
            lumber: await this.lumber.getAddress(),
        },
        __filename,
        1,
    );
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
