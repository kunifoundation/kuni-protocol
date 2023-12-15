const {expect} = require("chai");
const {parseUnits} = require("ethers");
const {ethers} = require("hardhat");

const log = console.log;

const {ZeroAddress} = ethers;

describe("------------- REFERRAL ------------------", () => {
    let developer, bob, alex, jame;
    let tx;

    before(async function () {
        // account init
        [developer, bob, alex, jame, ...addrs] = await ethers.getSigners();
        this.ow = developer;
        this.code = "AMAKUNI";
        this.referral = await (await ethers.deployContract("Referral", [developer.address, this.code])).waitForDeployment();
        // deploy
        await (await this.referral.connect(bob).applyCode(this.code)).wait();
    });

    it("00. Create code", async function () {
        const code = "AMA";
        const NEW_CODE = "NEW_CODE";
        const rate = 5000;
        tx = await this.referral.connect(bob).createCode(code, rate);
        await tx.wait();
        expect((await this.referral.refOwner(code)).rate).equal(rate);

        //
        await expect(this.referral.connect(bob).createCode(code, rate)).to.be.revertedWith("KUNI: ALREADY_EXISTS");

        await expect(this.referral.connect(alex).createCode(code, rate)).to.be.revertedWith("KUNI: APPLY_A_CODE");
        await (await this.referral.connect(alex).applyCode(this.code)).wait();

        await expect(this.referral.connect(bob).createCode("", rate)).to.be.revertedWith("KUNI: CODE_EMPTY");
        await expect(this.referral.connect(alex).createCode(code, rate)).to.be.revertedWith("KUNI: ALREADY_EXISTS");
        await expect(this.referral.connect(bob).createCode(NEW_CODE, 5000 * 3)).to.be.revertedWith("KUNI: MAX_RATE");
        await expect(this.referral.connect(bob).createCode(NEW_CODE, 5000 * 3)).to.be.revertedWith("KUNI: MAX_RATE");
        tx = await this.referral.connect(bob).createCode(NEW_CODE, 5000);
        await tx.wait();
        expect((await this.referral.refOwner("NEW_CODE")).rate).equal(parseUnits("5000", 0));
    });

    it("01. Apply code", async function () {
        const code = "AMA";
        const newCode = "NEW_CODE";
        const rate = parseUnits("40", 2);
        await expect(this.referral.connect(bob).createCode(code, rate)).to.be.revertedWith("KUNI: ALREADY_EXISTS");
        // tx = await this.referral.connect(bob).createCode(code, rate)
        // await tx.wait()
        await expect(this.referral.connect(alex).applyCode(newCode)).to.be.revertedWith("KUNI: NOT_ALLOWED");
        // tx = await this.referral.connect(alex).applyCode(code)
        // await tx.wait()
        // tx = await this.referral.connect(bob).createCode(newCode, parseUnits("80", 2))
        // await tx.wait()
        await expect(this.referral.connect(bob).applyCode(code)).to.be.revertedWith("KUNI: SELF_REF");
        await expect(this.referral.connect(bob).applyCode("NOT")).to.be.revertedWith("KUNI: REF_NOT_EXISTS");
        await expect(this.referral.connect(alex).applyCode(newCode)).to.be.revertedWith("KUNI: NOT_ALLOWED");
        tx = await this.referral.refPoint(alex.address, parseUnits("10", 2));
        expect(parseUnits("1250", 0)).equal(tx[0]);
        expect(parseUnits("25", 1)).equal(tx[1]);
        expect(this.ow.address).equal(tx[2]);
        tx = await this.referral.refPoint(jame.address, parseUnits("10", 2));
        expect(parseUnits("10", 2)).equal(tx[0]);
        expect(parseUnits("0", 2)).equal(tx[1]);
        expect(ZeroAddress).equal(tx[2]);

        tx = await this.referral.refPoint(bob.address, parseUnits("100", 2));
        expect(parseUnits("125", 2)).equal(tx[0]);
        expect(parseUnits("25", 2)).equal(tx[1]);
        expect(await this.ow.address).equal(tx[2]);
        expect((await this.referral.refOwner(code)).rate).equal(parseUnits("50", 2));
    });

    it("02. Set extral", async function () {
        tx = await this.referral.setExtra(10000);
        tx = await this.referral.setExtra(1000);
        tx = await this.referral.setExtra(0);
        await expect(this.referral.setExtra(10001)).revertedWith("KUNI: EXTRA_LARGE");
    });

    it("test", async function () {
        await await this.referral.connect(jame).applyCreateCode("AMA", "MY_AMA");
        log(await this.referral.balanceUserOf(jame.address));
        log(await this.referral.balanceCodeOf("AMA"));
        log(await this.referral.balanceCodeOf("MY_AMA"));
        log(await this.referral.userOfCodes(jame.address, 0));
        log(await this.referral.codeOfUsers("AMA", 0));

        log(await this.referral.codesOf(jame.address));
        log(await this.referral.codeRefOf("AMA"));
    });
});
