const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const deployContract = async (contractName, args) => {
  [alice] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.connect(alice).deploy(...(args || []));
  await contract.deployed();

  return contract;
};
const sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};

describe("Hodl", function () {
  let alice, bob, jack, maria;
  let aliceAddr, bobAddr, jackAddr, mariaAddr;
  let hodl, provider;

  before(async () => {
    provider = waffle.provider;
    [alice, bob, jack, maria] = await ethers.getSigners();
    [aliceAddr, bobAddr, jackAddr, mariaAddr] = await Promise.all(
      [alice, bob, jack, maria].map((x) => x.getAddress())
    );
    hodl = await deployContract("Hodl");
  });

  it("ethers should be deposited to smart contract", async function () {
    await hodl.deposit(2, { value: ethers.utils.parseEther("1.0") });
    expect(await provider.getBalance(hodl.address)).to.equal(
      ethers.utils.parseEther("1.0")
    );
  });

  it("Should not be allowed to withdraw ethers if it's already done", async function () {
    sleep(2000);
    await hodl.withdraw(1);
    await expect(hodl.withdraw(1)).to.be.revertedWith("Already Withdrawn");
    expect(await provider.getBalance(hodl.address)).to.equal(
      ethers.utils.parseEther("0.0")
    );
  });

  it("Should check Authorization for owner", async function () {
    await hodl
      .connect(alice)
      .deposit(2, { value: ethers.utils.parseEther("5.0") });
    await expect(hodl.connect(bob).withdraw(2)).to.be.revertedWith(
      "Unauthorized Access"
    );
    expect(await provider.getBalance(hodl.address)).to.equal(
      ethers.utils.parseEther("5.0")
    );
  });

  it("Should check for locking time duration", async function () {
    await hodl.deposit(3, { value: ethers.utils.parseEther("1.0") });
    await expect(hodl.withdraw(3)).to.be.revertedWith(
      "You can't withdraw ethers before unlocktime"
    );
    expect(await provider.getBalance(hodl.address)).to.equal(
      ethers.utils.parseEther("6.0")
    );
    sleep(3000);
    await hodl.withdraw(3);
    expect(await provider.getBalance(hodl.address)).to.equal(
      ethers.utils.parseEther("5.0")
    );
  });
});
