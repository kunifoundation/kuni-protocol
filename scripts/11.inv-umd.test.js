const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const log = console.log;

const TOKEN = require("./_v4/inv-umd");

const material = require("./_v4/materials");

async function allowance(addr, acc, spender) {
    const c = await (await ethers.getContractFactory("Material")).attach(addr);
    if ((await c.connect(acc).allowance(addr, spender)) <= 0) {
        const t = await c.approve(spender, ethers.MaxUint256);
        await t.wait();
    }
}

async function main() {
    log("deploy.....");
    let deployer, wThuan, wTest;
    [deployer, wThuan, wTest] = await ethers.getSigners();
    // const inv = await (await ethers.deployContract('AmaInv', [cm.ecoGame])).waitForDeployment()
    // const kuniItem = await (await ethers.deployContract('KuniItem')).waitForDeployment()
    const kuniItem = (await ethers.getContractFactory("KuniItem")).attach(TOKEN.kuniItem);
    const inv = (await ethers.getContractFactory("AmaInv")).attach(TOKEN.amaInv);
    // const inv      = (await ethers.getContractFactory('AmaInv')).attach(TOKEN.amaInv)
    // writeWithToken({
    //   amaInv: await inv.getAddress(),
    //   kuniItem: await kuniItem.getAddress(),
    // }, __filename, 1)

    // await (await inv.setMaterialPic([material.ore, material.stone, material.cotton, material.lumber ], [1,2,3,4])).wait()
    // await (await inv.setKuniItem(TOKEN.kuniItem)).wait()
    // await (await kuniItem.setMinter(TOKEN.amaInv)).wait()
    await allowance(material.cotton, wTest, TOKEN.amaInv);
    const rep = await (await inv.connect(wTest).craft([material.cotton], [ethers.parseEther("9.9")], 0)).wait();
    log(rep);
    // await (await this.inv.setMining(kuniGE.kuni)).wait()

    log("deployed!");
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
