const {expect} = require("chai");
const {ethers} = require("hardhat");
const _ = require("lodash");
const {cMintNft} = require("../js-commons/ama-data");

const log = console.log;

const {ZeroAddress, toNumber} = ethers;

async function approveNft(token, acc, operator) {
    if (!(await token.isApprovedForAll(acc.address, operator))) {
        await (await token.connect(acc).setApprovalForAll(operator, true)).wait();
        log("approve nft ", await token.getAddress());
    }
}

describe("------------- Staking token ------------------", () => {
    let owner, bob, alex, axi;
    let tx;
    before(async function () {
        // account init
        [owner, bob, alex, axi, ...addrs] = await ethers.getSigners();
        this.ow = owner;
        this.kuniSaru = await (await ethers.deployContract("KuniSaru")).waitForDeployment();
        this.amatsu = await (await ethers.deployContract("Scholarship")).waitForDeployment();

        this.amatsuAddr = await this.amatsu.getAddress();
        this.saruAddr = await this.kuniSaru.getAddress();

        // mint saru
        await cMintNft(this.kuniSaru, bob.address, 4);
        await cMintNft(this.kuniSaru, alex.address, 3);
    });

    it("00. SARU balanceOf", async function () {
        expect(await this.kuniSaru.balanceOf(bob.address)).equal(4);
        expect(await this.kuniSaru.balanceOf(alex.address)).equal(3);
    });

    it("01. Scholarship ASK", async function () {
        await approveNft(this.kuniSaru, bob, this.amatsuAddr);
        await approveNft(this.kuniSaru, alex, this.amatsuAddr);

        let total = await this.kuniSaru.balanceOf(alex.address);
        let tokenIds = (await Promise.all(_.range(0, Number(total)).map((index) => this.kuniSaru.tokenOfOwnerByIndex(alex.address, index)))).map(
            (t) => Number(t),
        );
        console.log(tokenIds.map((t) => toNumber(t)));

        total = await this.kuniSaru.balanceOf(bob.address);
        tokenIds = (await Promise.all(_.range(0, Number(total)).map((index) => this.kuniSaru.tokenOfOwnerByIndex(bob.address, index)))).map((t) =>
            Number(t),
        );
        console.log(tokenIds.map((t) => Number(t)));
        const RATE = 6900;
        // ask scholar tokenId
        await expect(this.amatsu.connect(bob).ask(this.saruAddr, 1, RATE * 2)).to.revertedWith("KUNI: Rate > 0 && Rate <= 10000");
        await expect(this.amatsu.connect(bob).ask(this.saruAddr, 1, 0)).to.revertedWith("KUNI: Rate > 0 && Rate <= 10000");
        await expect(this.amatsu.connect(bob).ask(ZeroAddress, 1, RATE)).to.revertedWith("KUNI: address to the zero address");
        tx = await this.amatsu.connect(bob).ask(this.saruAddr, 1, RATE);
        await expect(this.amatsu.connect(bob).ask(this.saruAddr, 5, RATE)).to.revertedWith("ERC721: transfer from incorrect owner");
        await tx.wait();
        expect(await this.amatsu.balanceOf(this.saruAddr, bob.address)).equal(1);
        expect(await this.amatsu.balanceOf(this.saruAddr, this.amatsuAddr)).equal(1);
        expect(await this.kuniSaru.balanceOf(bob.address)).equal(3);
        tx = await this.amatsu.ownerInfo(this.saruAddr, 1);
        expect(bob.address).equal(tx[0]);
        expect(RATE).equal(tx[1]);

        await expect(this.amatsu.connect(alex).cancel(this.saruAddr, 1)).revertedWith("KUNI: You is not owner");
        tx = await this.amatsu.connect(bob).cancel(this.saruAddr, 1);
        await tx.wait();

        tx = await this.amatsu.ownerInfo(this.saruAddr, 1);
        expect(ZeroAddress).equal(tx[0]);
        expect(0).equal(tx[1]);
        expect(await this.kuniSaru.balanceOf(bob.address)).equal(4);
        await expect(this.amatsu.connect(bob).cancel(this.saruAddr, 2)).to.revertedWith("KUNI: You is not owner");
        tx = await this.amatsu.ownerInfo(this.saruAddr, 0);
        expect(ZeroAddress).equal(tx[0]);
        expect(0).equal(tx[1]);
        expect(await this.kuniSaru.balanceOf(bob.address)).equal(4);
    });

    it("03. Scholarship ASK batch", async function () {
        expect(await this.amatsu.balanceOf(this.saruAddr, bob.address)).to.equal(0);
        expect(await this.kuniSaru.balanceOf(bob.address)).to.equal(4);
        tx = await this.amatsu.connect(bob).askBatch(this.saruAddr, [1, 2, 3], [4000, 4100, 4500]);
        await tx.wait();
        expect(await this.amatsu.balanceOf(this.saruAddr, bob.address)).to.equal(3);
        expect(await this.kuniSaru.balanceOf(bob.address)).to.equal(1);

        tx = await this.amatsu.connect(bob).cancelBatch(this.saruAddr, [2, 3]);
        await tx.wait();

        expect(await this.amatsu.balanceOf(this.saruAddr, bob.address)).to.equal(1);
        expect(await this.kuniSaru.balanceOf(bob.address)).to.equal(3);

        tx = await this.amatsu.connect(bob).cancelBatch(this.saruAddr, [1, 2, 3]);
        await tx.wait();
        expect(await this.amatsu.balanceOf(this.saruAddr, bob.address)).equal(0);
        expect(await this.kuniSaru.balanceOf(bob.address)).to.equal(4);
    });
});
