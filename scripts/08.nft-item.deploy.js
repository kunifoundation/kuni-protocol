const {ethers} = require("hardhat");
const {writeWithToken} = require("../js-commons/io");
const TOKENS = require("./_v4");
const log = console.log;

async function main() {
    log("deploy.....");
    // const storeGame = (await ethers.getContractFactory('StoreGame')).attach(TOKENS.storeGame)
    const kuniItem = await (await ethers.deployContract("KuniItem")).waitForDeployment();

    writeWithToken(
        {
            kuniItem: await kuniItem.getAddress(),
        },
        __filename,
        1,
    );
}

main()
    .catch((err) => log(err))
    .then(() => log("SUCCESS!"));
