const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const log = console.log;
const cm = require("./_v4/commons");
const material = require("./_v4/materials");

async function main() {
    log("deploy.....");
    this.inv = await (await ethers.deployContract("AmaInv", [cm.ecoGame])).waitForDeployment();
    // this.inv = (await ethers.getContractFactory('AmaInv')).attach('0xad56b3B49A5136ea41770fD969f4C88A028C8aca')
    writeWithToken(
        {
            amaInv: await this.inv.getAddress(),
        },
        __filename,
        1,
    );

    let tx = await this.inv.setMaterialPic([material.ore, material.stone, material.cotton, material.lumber], [1, 2, 3, 4]);
    await tx.wait();

    // await (await this.inv.setMining(kuniGE.kuni)).wait()

    log("deployed!");
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
