const { expect } = require('chai');
const { ethers } = require('hardhat');
const { CONTRACT_NAMES } = require('../utils/constants');
const { deployContract, sleep } = require('./utils');

describe('ERC20 Hodl', async () => {
  let alice, bob, jack, maria;
  let aliceAddr, bobAddr, jackAddr, mariaAddr;
  let erc20Hodl, mockErc20;

  before(async () => {
    [alice, bob, jack, maria] = await ethers.getSigners();

    erc20Hodl = await deployContract(CONTRACT_NAMES.ERC20_HODL);
    mockErc20 = await deployContract(CONTRACT_NAMES.MOCK_ERC20);
  });

  it('should revert if 0 tokens are passed', async () => {
    await expect(erc20Hodl.deposit(2, 0, mockErc20.target)).to.be.revertedWith(
      'Invalid amount: 0',
    );
  });

  it('should not deposit if the user does not have enough tokens', async () => {
    await expect(
      erc20Hodl.connect(bob).deposit(3, 1000000, mockErc20.target),
    ).to.be.revertedWith('Not enough balance');
  });

  it('should not deposit if the contract does not have enough allowance', async () => {
    await expect(
      erc20Hodl.deposit(3, 1000000, mockErc20.target),
    ).to.be.revertedWith('Not enough allowance');
  });

  it('ERC20 tokens should be deposited to the smart contract', async () => {
    await mockErc20.approve(erc20Hodl.target, 1000000);

    await erc20Hodl.deposit(3, 1000000, mockErc20.target);

    const hodlBalance = await mockErc20.balanceOf(erc20Hodl.target);

    expect(hodlBalance).to.be.equal(1000000);
  });

  it('should not allow unauthorized user to withdraw', async () => {
    await expect(erc20Hodl.connect(bob).withdraw(1)).to.be.revertedWith(
      'Unauthorized Access',
    );
  });

  it('should not allow user to withdraw tokens during locking time duration', async () => {
    await expect(erc20Hodl.withdraw(1)).to.be.revertedWith(
      "You can't withdraw tokens before unlocktime",
    );
  });

  it('should withdraw tokens after lock duration', async () => {
    sleep(1000);

    await erc20Hodl.withdraw(1);
    const hodlBalance = await mockErc20.balanceOf(erc20Hodl.target);

    expect(hodlBalance).to.be.equal(0);
  });

  it('should revert if user tries to withdraw the tokens which are already withdrawn', async () => {
    await expect(erc20Hodl.withdraw(1)).to.be.revertedWith('Already Withdrawn');
  });
});
