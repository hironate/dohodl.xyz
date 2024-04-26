const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const helpers = require('@nomicfoundation/hardhat-network-helpers');

describe('Launchpad', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLaunchpad() {
    // Contracts are deployed using the first signer/account by default
    const [
      launchpadadmin,
      projectOwner,
      address2,
      address3,
      address4,
      address5,
      otherAccount,
    ] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory('MockERC20');
    const mockERC20 = await MockERC20.deploy();

    const Launchpad = await ethers.getContractFactory('Launchpad');
    const launchpad = await Launchpad.deploy();

    return {
      mockERC20,
      launchpad,
      projectOwner,
      launchpadadmin,
      address2,
      address3,
      address4,
      address5,
      otherAccount,
    };
  }

  const currentTime = Math.ceil(Date.now() / 1000 + 15);

  describe('Launch Project Test Cases', async function () {
    it('Should revert if minimum investment is zero', async function () {
      const {
        mockERC20,
        launchpad,
        projectOwner,
        address2,
        address3,
        address4,
        address5,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = 1000000000000000000n;
      const minInvestment = 0;
      const maxInvestment = 5000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 10000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000) + 60;

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(
        launchpad,
        'MinimumInvestmentMustBeGreaterThanZero',
      );
    });

    it('Should revert if maximum investment is lesser than minimum investment', async function () {
      const {
        mockERC20,
        launchpad,
        projectOwner,
        address2,
        address3,
        address4,
        address5,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = 10000000000000000000n;
      const minInvestment = 50000000000000000000n;
      const maxInvestment = 40000000000000000000n;
      const maxCap = 1000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000) + 60;

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(
        launchpad,
        'MaxInvestmentMustBeGreaterOrEqualToMinInvestment',
      );
    });

    it('Should revert if hardcap is lesser than the maximum investment', async function () {
      const {
        mockERC20,
        launchpad,
        address2,
        address3,
        address4,
        address5,
        projectOwner,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = 10000000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 15000000000000000000000n;
      const maxCap = 1000000000000000000000n;
      const hardCap = 10000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000) + 60;

      const endTime = currentTimestampInSeconds;

      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxInvestment);
      await txn.wait();

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime + 60,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(
        launchpad,
        'MaxInvestmentShouldBeLessThanOrEqualToHardcap',
      );
    });

    it('Should revert if the whitelist addresses array is empty', async function () {
      const { mockERC20, launchpad, projectOwner } = await loadFixture(
        deployLaunchpad,
      );
      const TokenPrice = 10000000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 500000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const currentTimestampInSeconds = Math.floor(Date.now() / 1000) + 60;

      const endTime = currentTimestampInSeconds + 60;

      const whiteListedAddress = new Array();

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(launchpad, 'EmptyAddress');
    });

    it('Should revert if the whitelist addresses array contains a zero address', async function () {
      const {
        mockERC20,
        launchpad,
        address2,
        address3,
        address4,
        address5,
        projectOwner,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = 10000000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 500000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;
      const endTime = Math.floor(Date.now() / 1000) + 3600;

      const whiteListedAddress = [
        address2.address,
        '0x0000000000000000000000000000000000000000',
        address3.address,
        address4.address,
        address5.address,
      ];

      await expect(
        launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
    });

    it('Should revert if token address has already been whitelisted', async function () {
      const {
        mockERC20,
        launchpad,
        address2,
        address3,
        address4,
        address5,
        projectOwner,
        launchpadadmin,
      } = await loadFixture(deployLaunchpad);
      const TokenPrice = 10000000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 500000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const endTime = Math.floor(Date.now() / 1000) + 3600;
      const whiteListedAddress = [
        address2.address,
        address3.address,
        address4.address,
        address5.address,
      ];

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          currentTime + 1000000000,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            currentTime + 60,
            endTime,
            whiteListedAddress,
          ),
      ).to.be.revertedWithCustomError(launchpad, 'TokenAlreadyWhitelisted');
    });
  });

  describe('Invest Project Test Case', function () {
    // it('Should revert if caller is not a whitelisted user', async function () {
    //   const {
    //     launchpad,
    //     mockERC20,
    //     address2,
    //     projectOwner,
    //     address3,
    //     address4,
    //     address5,
    //     otherAccount,
    //   } = await loadFixture(deployLaunchpad);

    //   const TokenPrice = 10000000000000000000n;
    //   const minInvestment = 1000000000000000000n;
    //   const maxInvestment = 500000000000000000000n
    //   const maxCap = 10000000000000000000000n;
    //   const hardCap = 100000000000000000000000n
    //   const softCap = 1000000000000000000n;
    //   const liquidityPercentToken=7000;
    //   const liquidityPercentEth=3000;

    //   const endTime = Math.floor(Date.now() / 1000) + 3600;
    //   const whiteListedAddress = [
    //     address2.address,
    //     address3.address,
    //     address4.address,
    //     address5.address,
    //   ];

    //   const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
    //   await mintTxn.wait();

    //   const txn = await mockERC20
    //     .connect(projectOwner)
    //     .approve(launchpad.target, maxCap);
    //   await txn.wait();

    //   const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
    //   await network.provider.send('evm_setNextBlockTimestamp', [
    //     desiredTimestamp,
    //   ]);

    //   const LaunchProject = await launchpad
    //     .connect(projectOwner)
    //     .listProject(
    //       mockERC20.target,
    //       minInvestment,
    //       maxInvestment,
    //       maxCap,
    //       softCap,
    //       hardCap,
    //       liquidityPercentToken,
    //       liquidityPercentEth,
    //       desiredTimestamp,
    //       endTime,
    //       whiteListedAddress,
    //     );
    //   LaunchProject.wait();

    //   await expect(
    //     launchpad.connect(otherAccount).invest(1),
    //   ).to.be.revertedWithCustomError(launchpad, 'NotWhiteListed');
    // });

    it("Should revert if project ID doesn't exist", async function () {
      const { mockERC20, projectOwner, address2, launchpad, otherAccount } =
        await loadFixture(deployLaunchpad);

      const TokenPrice = 10000000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 500000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const endTime = Math.floor(Date.now() / 1000) + 3600;
      const whiteListedAddress = [address2.address, otherAccount.address];

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(12),
      ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
    });

    // it('Should revert if contract has not been fully funded with the tokens for sale', async function () {
    //   const { launchpad, projectOwner, mockERC20, otherAccount, address2 } =
    //     await loadFixture(deployLaunchpad);

    //   const TokenPrice = 10000000000000000000n;
    //   const minInvestment = 1000000000000000000n;
    //   const maxInvestment = 500000000000000000000n
    //   const maxCap = 10000000000000000000000n;

    //   const endTime = Math.floor(Date.now() / 1000) + 3600;
    //   const whiteListedAddress = [address2.address, otherAccount.address];

    //   const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
    //   await mintTxn.wait();

    //   const txn = await mockERC20
    //     .connect(projectOwner)
    //     .approve(launchpad.target, maxCap);
    //   await txn.wait();

    //   const LaunchProject = await launchpad
    //     .connect(projectOwner)
    //     .listProject(
    //       mockERC20.target,
    //
    //       minInvestment,
    //       maxInvestment,
    //       maxCap,softCap,
    //       endTime,
    //       whiteListedAddress,
    //     );
    //   LaunchProject.wait();

    //   await expect(
    //     launchpad
    //       .connect(address2)
    //       .invest(1, { value: 1000000000000000000n }),
    //   ).to.be.revertedWithCustomError(launchpad, 'ContractNotFullyFunded');
    // });

    it('Should revert if project has ended', async function () {
      const {
        launchpad,
        launchpadadmin,
        mockERC20,
        otherAccount,
        address2,
        projectOwner,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = 10000000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 500000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = 1000000000000000000n;

      const endTime = Math.floor(Date.now() / 1000) + 1;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await mockERC20
      //   .connect(launchpadadmin)
      //   .mint(launchpad.target, maxCap);
      // TransferTokens.wait();

      const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(launchpadadmin)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(launchpadadmin)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          0,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectEnded');
    });

    it('Should revert if investment amount is below the minimum investment amount for IDO project', async function () {
      const {
        launchpad,
        launchpadadmin,
        projectOwner,
        mockERC20,
        otherAccount,
        address2,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = 10000000000000000000n;
      const minInvestment = 5000000000000000000n;
      const maxInvestment = 500000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const amount = 1000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await mockERC20
      //   .connect(launchpadadmin)
      //   .mint(launchpad.target, maxCap);
      // TransferTokens.wait();

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentAmtBelowMinimum');
    });

    it('Should revert if total investment amount of a user exceeds maximum set investment amount per account', async function () {
      const {
        launchpad,
        launchpadadmin,
        projectOwner,
        mockERC20,
        otherAccount,
        address2,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = 10000000000000000000n;
      const minInvestment = 2000000000000000000n;
      const maxInvestment = 10000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 100000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = 12000000000000000000n;

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await mockERC20
      //   .connect(launchpadadmin)
      //   .mint(launchpad.target, maxCap);
      // TransferTokens.wait();

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentAmtExceedsMaximum');
    });

    it('Should revert if total allocation is greater than project Maximum Cap', async function () {
      const {
        launchpad,
        launchpadadmin,
        projectOwner,
        mockERC20,
        otherAccount,
        address2,
        address3,
        address4,
        address5,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = 500000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 10000000000000000000n;
      const maxCap = 25000000000000000000n;
      const hardCap = 12500000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = 10000000000000000000n;

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [
        address2.address,
        otherAccount.address,
        address5.address,
      ];

      //fund contract
      // const TransferTokens = await mockERC20
      //   .connect(launchpadadmin)
      //   .mint(launchpad.target, maxCap);
      // TransferTokens.wait();

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(projectOwner)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(1, { value: amount });
      Invest.wait();

      const getUserInvestmentHere =
        await launchpad.getUserInvestmentForAnIDOInCELO(1, address2.address);

      await expect(launchpad.connect(address5).invest(1, { value: amount }))
        .to.be.revertedWithCustomError(
          launchpad,
          'InvestmentAmountExceedsHardcap',
        )
        .withArgs(2500000000000000000n);
    });

    it('Should invest successfully', async function () {
      const { launchpad, launchpadadmin, mockERC20, otherAccount, address2 } =
        await loadFixture(deployLaunchpad);

      const TokenPrice = 1000000000000000000n;
      const minInvestment = 2000000000000000000n;
      const maxInvestment = 10000000000000000000n;
      const maxCap = 10000000000000000000000n;
      const hardCap = 10000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = 2000000000000000000n;

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [address2.address, otherAccount.address];

      //fund contract
      // const TransferTokens = await mockERC20
      //   .connect(launchpadadmin)
      //   .mint(launchpad.target, maxCap);
      // TransferTokens.wait();

      const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(launchpadadmin)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(launchpadadmin)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(1, { value: amount });
      Invest.wait();

      const userInvestment = await launchpad.getUserInvestmentForAnIDOInCELO(
        1,
        address2.address,
      );

      expect(userInvestment).to.be.equal(amount);
    });

    // it('Should invest successfullyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', async function () {
    //   const { launchpad, launchpadadmin, mockERC20, otherAccount, address2 } =
    //     await loadFixture(deployLaunchpad);

    //   const TokenPrice = 1000000000000000000n;
    //   const minInvestment = 2000000000000000000n
    //   const maxInvestment = 100000000000000000000n
    //   const maxCap = 100000000000000000000n
    //   const hardCap = 100000000000000000000n
    //   const softCap = 1000000000000000000n;
    //   const liquidityPercentToken=7000;
    //   const liquidityPercentEth=3000;

    //   const amount = 2000000000000000000n

    //   const endTime = Math.floor(Date.now() / 1000) + 100;
    //   const whiteListedAddress = [address2.address, otherAccount.address];

    //   //fund contract
    //   // const TransferTokens = await mockERC20
    //   //   .connect(launchpadadmin)
    //   //   .mint(launchpad.target, maxCap);
    //   // TransferTokens.wait();

    //   const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
    //   await mintTxn.wait();

    //   const txn = await mockERC20
    //     .connect(launchpadadmin)
    //     .approve(launchpad.target, maxCap);
    //   await txn.wait();

    //   const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
    //   await network.provider.send('evm_setNextBlockTimestamp', [
    //     desiredTimestamp,
    //   ]);

    //   const LaunchProject = await launchpad
    //     .connect(launchpadadmin)
    //     .listProject(
    //       mockERC20.target,
    //       minInvestment,
    //       maxInvestment,
    //       maxCap,
    //       softCap,
    //       hardCap,
    //       liquidityPercentToken,
    //       liquidityPercentEth,
    //       desiredTimestamp,
    //       endTime,
    //       whiteListedAddress,
    //     );
    //   LaunchProject.wait();

    //   const Invest = await launchpad
    //     .connect(address2)
    //     .invest(1, { value: hardCap });
    //   Invest.wait();

    //   console.log(await mockERC20.balanceOf(address2.address));

    //   await launchpad.connect(address2).claimTokens(1);

    //   console.log(await mockERC20.balanceOf(address2.address));

    //   const userInvestment = await launchpad.getUserInvestmentForAnIDOInCELO(
    //     1,
    //     address2.address,
    //   );

    //   expect(userInvestment).to.be.equal(hardCap);
    // });

    it('Should revert if project is not active', async function () {
      const {
        launchpad,
        launchpadadmin,
        mockERC20,
        otherAccount,
        address2,
        address3,
      } = await loadFixture(deployLaunchpad);

      const TokenPrice = 200000000000000000n;
      const minInvestment = 1000000000000000000n;
      const maxInvestment = 10000000000000000000n;
      const maxCap = 5000000000000000000000n;
      const hardCap = 1000000000000000000000n;
      const softCap = 1000000000000000000n;
      const liquidityPercentToken = 7000;
      const liquidityPercentEth = 3000;

      const amount = 5000000000000000000n;

      const endTime = Math.floor(Date.now() / 1000) + 100;
      const whiteListedAddress = [
        address2.address,
        address3.address,
        otherAccount.address,
      ];

      //fund contract
      // const TransferTokens = await mockERC20
      //   .connect(launchpadadmin)
      //   .mint(launchpad.target, maxCap);
      // TransferTokens.wait();

      const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(launchpadadmin)
        .approve(launchpad.target, maxCap);
      await txn.wait();

      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp,
      ]);

      const LaunchProject = await launchpad
        .connect(launchpadadmin)
        .listProject(
          mockERC20.target,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          desiredTimestamp,
          endTime,
          whiteListedAddress,
        );
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(1, { value: amount });
      Invest.wait();

      const cancelProject = await launchpad
        .connect(launchpadadmin)
        .cancelIDOProject(1);
      cancelProject.wait();

      await expect(
        launchpad.connect(address2).invest(1, { value: amount }),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectNotActive');
    });

    describe('ClaimToken Function Testcases', function () {
      it('Should revert if project ID is invalid', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).claimTokens(0),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if caller is not an project investor', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const amount = 5000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [address2.address, otherAccount.address];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(launchpadadmin)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        await expect(
          launchpad.connect(address3).claimTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'YouAreNotAnInvestor');
      });

      it('Should revert if tokens are claimed already', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 10000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });

        await launchpad.connect(address2).claimTokens(1);

        await expect(
          launchpad.connect(address2).claimTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ClaimedAlready');
      });

      it('Should revert if investment amount not reached to softcap', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 1000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });
        await expect(
          launchpad.connect(address4).claimTokens(1),
        ).to.be.revertedWithCustomError(
          launchpad,
          'InvestmentNotReachedSoftcap',
        );
      });
      it('Should revert if project is not ended yet', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 3000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });
        await expect(
          launchpad.connect(address4).claimTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
      });

      it('Should claim tokens', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 6000;
        const liquidityPercentEth = 4000;
        const amount = 3000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        expect(await mockERC20.balanceOf(address4.address)).to.be.equal(0);
        await launchpad.connect(address4).invest(1, { value: hardCap });

        await launchpad.connect(address4).claimTokens(1),
          expect(await mockERC20.balanceOf(address4.address)).to.be.equal(
            40000000000000000000n,
          );
      });
    });

    describe('Refund Function Testcases', function () {
      it('Should revert if project ID is invalid', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).refundTokens(0),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if tokens are claimed already', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 1000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 1000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address3).invest(1, { value: amount });
        const refundTimestamp = Math.floor(Date.now() / 1000) + 1000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await launchpad.connect(address2).refundTokens(1);

        await expect(
          launchpad.connect(address2).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ClaimedAlready');
      });

      it('Should revert if caller is not an project owner', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const amount = 5000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [address2.address, otherAccount.address];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(launchpadadmin)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        const refundTimestamp = Math.floor(Date.now() / 1000) + 1000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await expect(
          launchpad.connect(address3).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });

      it('Should revert if investment amount exceeds softcap', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 3000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });

        const refundTimestamp = Math.floor(Date.now() / 1000) + 2000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await expect(
          launchpad.connect(address2).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'IneligibleForRefund');
      });
      it('Should revert if project is not ended yet', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 1000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: amount });
        await expect(
          launchpad.connect(address2).refundTokens(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
      });

      it('Should get refund of tokens', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 6000;
        const liquidityPercentEth = 4000;
        const amount = 1000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 1000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        const userBalanceBeforeRefund = await mockERC20.balanceOf(
          address2.address,
        );

        await launchpad.connect(address4).invest(1, { value: amount });

        const refundTimestamp = Math.floor(Date.now() / 1000) + 1000;
        await network.provider.send('evm_setNextBlockTimestamp', [
          refundTimestamp,
        ]);

        await launchpad.connect(address2).refundTokens(1);
        expect(
          await mockERC20.connect(address2).balanceOf(address2.address),
        ).to.be.equal(maxCap);

        //   40000000000000000000n
        // );
      });
    });

    describe('Add User For A Particular IDO Project Functionality', function () {
      it('Should revert if caller is not project owner', async function () {
        const {
          launchpad,
          launchpadadmin,
          projectOwner,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 5000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(launchpadadmin)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(address2)
            .AddUserForAParticularProject(1, projectOwner.address),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });

      it('Should revert if the inputed address is an zero address', async function () {
        const {
          launchpad,
          launchpadadmin,
          projectOwner,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(projectOwner)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(projectOwner)
            .AddUserForAParticularProject(
              1,
              '0x0000000000000000000000000000000000000000',
            ),
        ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
      });

      it('Should revert if the inputed address has already been whitelisted', async function () {
        const {
          launchpad,
          launchpadadmin,
          projectOwner,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(projectOwner)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(projectOwner)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(projectOwner)
            .AddUserForAParticularProject(1, otherAccount.address),
        ).to.be.revertedWithCustomError(launchpad, 'UserAlreadyWhitelisted');
      });

      it("Should revert if the inputed projectID doesn't exist", async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(launchpadadmin)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(launchpadadmin)
            .AddUserForAParticularProject(12, otherAccount.address),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });
    });

    describe('Withdraw Amount Raised For An IDO project Test Case', function () {
      it('Should revert if caller is not IDO project owner', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const amount = 5000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(launchpadadmin)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        await expect(
          launchpad.connect(address2).withdrawAmountRaised(1),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });
      it('Should revert if project ID is invalid', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).withdrawAmountRaised(10),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if project is still in progress', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 5000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address2).invest(1, { value: amount });
        await expect(
          launchpad.connect(address2).withdrawAmountRaised(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
      });

      it('Should not revert if duration is not over but hardcap is reached', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
          address4,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 2000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;
        const amount = 5000000000000000000n;

        const endTime = Math.floor(Date.now() / 1000) + 10000;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          address4.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad.connect(address4).invest(1, { value: softCap });
        await expect(
          launchpad.connect(address2).withdrawAmountRaised(1),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
        await launchpad
          .connect(address3)
          .invest(1, { value: 8000000000000000000n });

        await launchpad.connect(address2).withdrawAmountRaised(1);

        expect(await ethers.provider.getBalance(launchpad.target)).to.equal(
          3000000000000000000n,
        );
      });
    });

    describe('Project Cancellation Test Cases', function () {
      it('Should revert if caller is not launchpad admin', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(launchpadadmin.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(launchpadadmin)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(launchpadadmin)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(otherAccount).cancelIDOProject(1),
        ).to.be.revertedWithCustomError(launchpad, 'NotLaunchPadAdmin');
      });

      it('Should cancel and send the IDO tokens to the project owner successfully', async function () {
        const {
          launchpad,
          launchpadadmin,
          mockERC20,
          otherAccount,
          address2,
          address3,
        } = await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const amount = 5000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        //fund contract
        // const TransferTokens = await mockERC20
        //   .connect(launchpadadmin)
        //   .mint(launchpad.target, maxCap);
        // TransferTokens.wait();

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        const Invest = await launchpad
          .connect(address2)
          .invest(1, { value: amount });
        Invest.wait();

        const OwnerBalanceBeforeCancellation = await mockERC20.balanceOf(
          address2.address,
        );

        const Cancel = await launchpad
          .connect(launchpadadmin)
          .cancelIDOProject(1);
        Cancel.wait();

        const OwnerBalanceAfterCancellation = await mockERC20.balanceOf(
          address2.address,
        );

        expect(OwnerBalanceAfterCancellation).to.be.equal(maxCap);

        const ProjectTotalRaisedFunds =
          await launchpad.getProjectTotalAmtRaised(1);

        const WithdrawAmountGottenSofar = await launchpad
          .connect(address2)
          .withdrawAmountRaised(1);
        WithdrawAmountGottenSofar.wait();
      });
    });

    describe('Launchpad Admin Change Test Case', function () {
      it('Should revert when contract is paused', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).changeLaunchPadAdmin(address2.address),
        ).to.be.reverted;
      });
      it('Should revert if caller is not launchpad admin', async function () {
        const { launchpad, address3 } = await loadFixture(deployLaunchpad);

        await expect(
          launchpad.connect(address3).changeLaunchPadAdmin(address3.address),
        ).to.be.revertedWithCustomError(launchpad, 'NotLaunchPadAdmin');
      });

      it('Should revert if the inputed address is a zero address', async function () {
        const { launchpadadmin, launchpad } = await loadFixture(
          deployLaunchpad,
        );

        await expect(
          launchpad
            .connect(launchpadadmin)
            .changeLaunchPadAdmin('0x0000000000000000000000000000000000000000'),
        ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
      });

      it('Should revert if the inputed address is the same as the current launchpad admin address', async function () {
        const { launchpadadmin, launchpad } = await loadFixture(
          deployLaunchpad,
        );

        await expect(
          launchpad
            .connect(launchpadadmin)
            .changeLaunchPadAdmin(launchpadadmin.address),
        ).to.be.revertedWithCustomError(launchpad, 'OldAdmin');
      });

      it('Should set the new launchpad admin successfully', async function () {
        const { launchpadadmin, launchpad, address3 } = await loadFixture(
          deployLaunchpad,
        );

        const OldAdmin = await launchpad.launchPadadmin();

        const SetNewAdmin = await launchpad
          .connect(launchpadadmin)
          .changeLaunchPadAdmin(address3.address);
        SetNewAdmin.wait();

        expect(await launchpad.launchPadadmin()).to.be.equal(address3.address);
      });
    });

    describe('Sweep Function Test Case', function () {
      it('Should revert if caller is not project owner', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = 10;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address3).sweep(1, address3.address),
        ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
      });

      it('Should revert when contract is paused', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);
        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(launchpad.connect(address2).sweep(1, address2.address)).to
          .be.reverted;
      });

      it('Should revert if project ID is not valid', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).sweep(10, address2.address),
        ).to.be.revertedWithCustomError(launchpad, 'InvalidProjectID');
      });

      it('Should revert if inputed address is an address zero', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad
            .connect(address2)
            .sweep(1, '0x0000000000000000000000000000000000000000'),
        ).to.be.revertedWithCustomError(launchpad, 'AddressZero');
      });

      it('Should revert if project is still ongoing', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 200000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 5000000000000000000000n;
        const hardCap = 1000000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await expect(
          launchpad.connect(address2).sweep(1, address2.address),
        ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
      });

      it('Should revert if hardcap is reached', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = Math.floor(Date.now() / 1000) + 100;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();

        await launchpad
          .connect(address3)
          .invest(1, { value: 10000000000000000000n });

        await expect(
          launchpad.connect(address2).sweep(1, address2.address),
        ).to.be.revertedWithCustomError(
          launchpad,
          'HardCapReachedNoTokensToSweep',
        );
      });

      it('Should not revert if hardcap is not reached and project is over', async function () {
        const { launchpad, mockERC20, otherAccount, address2, address3 } =
          await loadFixture(deployLaunchpad);

        const TokenPrice = 100000000000000000n;
        const minInvestment = 1000000000000000000n;
        const maxInvestment = 10000000000000000000n;
        const maxCap = 100000000000000000000n;
        const hardCap = 10000000000000000000n;
        const softCap = 1000000000000000000n;
        const liquidityPercentToken = 7000;
        const liquidityPercentEth = 3000;

        const endTime = 0;
        const whiteListedAddress = [
          address2.address,
          address3.address,
          otherAccount.address,
        ];

        const mintTxn = await mockERC20.mint(address2.address, maxCap);
        await mintTxn.wait();

        const txn = await mockERC20
          .connect(address2)
          .approve(launchpad.target, maxCap);
        await txn.wait();

        const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
        await network.provider.send('evm_setNextBlockTimestamp', [
          desiredTimestamp,
        ]);

        const LaunchProject = await launchpad
          .connect(address2)
          .listProject(
            mockERC20.target,
            minInvestment,
            maxInvestment,
            maxCap,
            softCap,
            hardCap,
            liquidityPercentToken,
            liquidityPercentEth,
            desiredTimestamp,
            endTime,
            whiteListedAddress,
          );
        LaunchProject.wait();
        expect(await mockERC20.balanceOf(launchpad.target)).to.equal(
          100000000000000000000n,
        );
        expect(await mockERC20.balanceOf(address2.address)).to.equal(0);
        await launchpad.connect(address2).sweep(1, address2.address),
          expect(await mockERC20.balanceOf(address2.address)).to.equal(
            100000000000000000000n,
          );
        expect(await mockERC20.balanceOf(launchpad.target)).to.equal(0);
      });
    });

    describe('When launchpad is paused', function () {
      it('Should revert if caller is not launchpad admin', async function () {
        const { launchpad, address2, launchpadadmin } = await loadFixture(
          deployLaunchpad,
        );

        await expect(
          launchpad.connect(address2).pause(),
        ).to.be.revertedWithCustomError(launchpad, 'NotLaunchPadAdmin');
      });
    });
  });
});
