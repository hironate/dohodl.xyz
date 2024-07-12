const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const { ERC721ABI } = require('../utils/constants');

describe('Launchpad', function () {
  const minimumDuration = 24 * 60 * 60;
  const liquidityPercentToken = 3000n;
  const liquidityPercentEth = 7000n;
  const BPS = 10000n;
  const getCurrentTime = () => Math.ceil(Date.now() / 1000 + 15);
  const positionManager = '0x1238536071e1c677a632429e3655c799b22cda52';

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
    const launchpad = await Launchpad.deploy(
      '0x0227628f3f023bb0b980b67d528571c95c6dac1c',
      positionManager,
      '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    );

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

  const listProject = async ({
    launchpad = null,
    tokenAddress = null,
    projectOwner = null,
    minInvestment = 1000000000000000000n,
    maxInvestment = 10000000000000000000n,
    maxCap = 10000000000000000000000n,
    softCap = 1000000000000000000n,
    hardCap = 10000000000000000000000n,
    startTime = getCurrentTime(),
    duration = minimumDuration,
    withDeployments = true,
  }) => {
    let mockERC20;
    let extraAccounts;
    if (withDeployments) {
      ({ mockERC20, launchpad, projectOwner, ...extraAccounts } =
        await loadFixture(deployLaunchpad));
      tokenAddress = mockERC20.target;

      const mintTxn = await mockERC20.mint(projectOwner.address, maxCap);
      await mintTxn.wait();

      const txn = await mockERC20
        .connect(projectOwner)
        .approve(launchpad.target, maxCap);
      await txn.wait();
    }

    return {
      listingTx: launchpad
        .connect(projectOwner)
        .listProject(
          tokenAddress,
          minInvestment,
          maxInvestment,
          maxCap,
          softCap,
          hardCap,
          liquidityPercentToken,
          liquidityPercentEth,
          startTime,
          duration,
        ),
      launchpad,
      mockERC20,
      projectOwner,
      ...extraAccounts,
    };
  };

  describe('List Project Test Cases', async function () {
    it('Should revert if minimum investment is zero', async function () {
      const { mockERC20, launchpad, projectOwner, listingTx } =
        await listProject({
          minInvestment: 0,
        });

      await expect(listingTx).to.be.revertedWithCustomError(
        launchpad,
        'MinimumInvestmentMustBeGreaterThanZero',
      );
    });

    it('Should revert if maximum investment is lesser than minimum investment', async function () {
      const { launchpad, listingTx } = await listProject({
        minInvestment: 50000000000000000000n,
        maxInvestment: 40000000000000000000n,
      });

      await expect(listingTx).to.be.revertedWithCustomError(
        launchpad,
        'MaxInvestmentMustBeGreaterOrEqualToMinInvestment',
      );
    });

    it('Should revert if hardcap is lesser than the maximum investment', async function () {
      const { mockERC20, launchpad, projectOwner, listingTx } =
        await listProject({
          hardCap: 10000000000000000000000n,
          maxInvestment: 15000000000000000000000n,
        });

      await expect(listingTx).to.be.revertedWithCustomError(
        launchpad,
        'MaxInvestmentShouldBeLessThanOrEqualToHardcap',
      );
    });

    it('Should revert if token has already been used for creating porject', async function () {
      const {
        mockERC20,
        launchpad,
        address2,
        listingTx: response,
      } = await listProject({});

      await (await response).wait();

      const { listingTx } = await listProject({
        projectOwner: address2,
        launchpad,
        tokenAddress: mockERC20.target,
        withDeployments: false,
      });
      await expect(listingTx).to.be.revertedWithCustomError(
        launchpad,
        'ProjectIsAlreadyInitializedOrActive',
      );
    });
  });

  describe('Invest Project Test Case', function () {
    it('Should revert if project is not initialzied', async function () {
      const { mockERC20, address2, launchpad, listingTx } = await listProject({
        duration: 0n,
        startTime: 0n,
      });

      const listing = await listingTx;
      listing.wait();

      await expect(
        launchpad.connect(address2).invest(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectNotActive');
    });

    it('Should revert if project has ended', async function () {
      const desiredTimestamp = Math.floor(Date.now() / 1000) + 60;
      const { launchpad, mockERC20, address2, listingTx } = await listProject({
        startTime: desiredTimestamp,
      });
      await (await listingTx).wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        desiredTimestamp + minimumDuration,
      ]);

      await expect(
        launchpad
          .connect(address2)
          .invest(mockERC20.target, { value: 1000000000000000000n }),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectEnded');
    });

    it('Should revert if investment amount is below the minimum investment amount for project', async function () {
      const { launchpad, mockERC20, address2, listingTx } = await listProject(
        {},
      );
      await (await listingTx).wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await expect(
        launchpad
          .connect(address2)
          .invest(mockERC20.target, { value: 10000000n }),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentAmtBelowMinimum');
    });

    it('Should revert if total investment amount of a user exceeds maximum set investment amount per account', async function () {
      const { launchpad, projectOwner, mockERC20, listingTx, address2 } =
        await listProject({});

      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await expect(
        launchpad
          .connect(address2)
          .invest(mockERC20.target, { value: 11000000000000000000n }),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentAmtExceedsMaximum');
    });

    it('Should revert if total investment exceeds project hard_cap', async function () {
      const {
        launchpad,
        listingTx,
        projectOwner,
        mockERC20,
        address2,
        address5,
      } = await listProject({
        hardCap: 12500000000000000000n,
        softCap: 1000000000000000000n,
        minInvestment: 1000000000000000000n,
        maxInvestment: 10000000000000000000n,
      });

      const amount = 10000000000000000000n;

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      const LaunchProject = await listingTx;
      LaunchProject.wait();

      const Invest = await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: amount });
      Invest.wait();

      await expect(
        launchpad.connect(address5).invest(mockERC20.target, { value: amount }),
      )
        .to.be.revertedWithCustomError(
          launchpad,
          'InvestmentAmountExceedsHardcap',
        )
        .withArgs(2500000000000000000n);
    });

    it('Should invest successfully', async function () {
      const { launchpad, launchpadadmin, mockERC20, otherAccount, address2 } =
        await listProject({});

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      const Invest = await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      Invest.wait();

      const userInvestment = await launchpad.projectInvestments(
        mockERC20.target,
        address2.address,
      );

      expect(userInvestment).to.be.equal(1000000000000000000n);
    });

    it('Should revert if project is not active', async function () {
      const { launchpad, listingTx, mockERC20, address2, launchpadadmin } =
        await listProject({});

      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      const Invest = await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      Invest.wait();

      const cancelProject = await launchpad
        .connect(launchpadadmin)
        .cancelProject(mockERC20.target);
      cancelProject.wait();

      await expect(
        launchpad
          .connect(address2)
          .invest(mockERC20.target, { value: 1000000000000000000n }),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectNotActive');
    });
  });

  describe('ClaimToken Function Testcases', function () {
    it('Should revert if caller is not an project investor', async function () {
      const {
        launchpad,
        launchpadadmin,
        mockERC20,
        listingTx,
        address2,
        address3,
      } = await listProject({});

      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await expect(
        launchpad.connect(address3).claimTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'YouAreNotAnInvestor');
    });

    it('Should revert if tokens are claimed already', async function () {
      const { launchpad, listingTx, mockERC20, address2 } = await listProject(
        {},
      );

      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);
      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);
      await launchpad.connect(address2).claimTokens(mockERC20.target);

      await expect(
        launchpad.connect(address2).claimTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'ClaimedAlready');
    });

    it('Should revert if investment amount not reached to softcap', async function () {
      const { launchpad, listingTx, mockERC20, address4 } = await listProject({
        softCap: 10000000000000000000n,
      });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await launchpad
        .connect(address4)
        .invest(mockERC20.target, { value: 1000000000000000000n });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await expect(
        launchpad.connect(address4).claimTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentNotReachedSoftcap');
    });

    it('Should revert if project is not ended yet', async function () {
      const { launchpad, listingTx, mockERC20, address4 } = await listProject(
        {},
      );

      await (await listingTx).wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address4)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      await expect(
        launchpad.connect(address4).claimTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
    });

    it('Should claim tokens', async function () {
      const { launchpad, listingTx, mockERC20, address2, address4 } =
        await listProject({
          hardCap: 10000000000000000000n,
          softCap: 2000000000000000000n,
          maxInvestment: 10000000000000000000n,
          minInvestment: 1000000000000000000n,
          maxCap: 100000000000000000000n,
          liquidityPercentToken: 6000,
          liquidityPercentEth: 4000,
        });
      const amount = 3000000000000000000n;
      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      expect(await mockERC20.balanceOf(address4.address)).to.be.equal(0);

      await launchpad
        .connect(address4)
        .invest(mockERC20.target, { value: amount });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      // tokenAllocation calculation amount * ((tokenMaxCap * (BPS - liquidityPercentToken)) /BPS) / amountRaised
      const tokenAllocation =
        (amount *
          ((100000000000000000000n * (BPS - liquidityPercentToken)) / BPS)) /
        amount;

      await launchpad.connect(address4).claimTokens(mockERC20.target);

      expect(await mockERC20.balanceOf(address4.address)).to.be.equal(
        tokenAllocation,
      );
    });
  });

  describe('Refund Function Test cases', function () {
    it('Should revert if tokens are claimed/witdhrawn already', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner, address3 } =
        await listProject({});

      await (await listingTx).wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await launchpad.connect(projectOwner).refundTokens(mockERC20.target);

      await expect(
        launchpad.connect(projectOwner).refundTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'AlreadyWithdrawn');
    });

    it('Should revert if caller is not an project owner', async function () {
      const { launchpad, listingTx, mockERC20, address2, address3 } =
        await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await expect(
        launchpad.connect(address3).refundTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
    });

    it('Should revert if investment amount exceeds softcap', async function () {
      const { launchpad, mockERC20, listingTx, address2, projectOwner } =
        await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);
      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await expect(
        launchpad.connect(projectOwner).refundTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'IneligibleForRefund');
    });

    it('Should revert if project is not ended yet', async function () {
      const { launchpad, listingTx, mockERC20, address2, projectOwner } =
        await listProject({ minInvestment: 10000000000n });

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 10000000000n });

      await expect(
        launchpad.connect(projectOwner).refundTokens(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
    });

    it('Should get refund of tokens', async function () {
      const {
        launchpad,
        listingTx,
        mockERC20,
        otherAccount,
        address2,
        projectOwner,
      } = await listProject({ minInvestment: 10000000n });

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      const userBalanceBeforeRefund = await mockERC20.balanceOf(
        projectOwner.address,
      );

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 10000000n });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await launchpad.connect(projectOwner).refundTokens(mockERC20.target);
      expect(
        await mockERC20.connect(projectOwner).balanceOf(projectOwner.address),
      ).to.be.equal(10000000000000000000000n);
    });
  });

  describe('Withdraw Amount Raised For An Project Test Case', function () {
    it('Should revert if caller is not project owner', async function () {
      const { launchpad, mockERC20, address2, listingTx } = await listProject(
        {},
      );

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      await expect(
        launchpad.connect(address2).withdrawAmountRaised(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
    });

    it('Should revert if project is still in progress', async function () {
      const { launchpad, mockERC20, address2, listingTx, projectOwner } =
        await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      await expect(
        launchpad.connect(projectOwner).withdrawAmountRaised(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectStillInProgress');
    });

    it('Should not revert if duration is not over but hardcap is reached', async function () {
      const {
        launchpad,
        mockERC20,
        address2,
        listingTx,
        projectOwner,
        address3,
      } = await listProject({
        maxInvestment: 1000000000000000000n,
        hardCap: 1000000000000000000n,
        softCap: 10000000000n,
      });

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await expect(
        launchpad.connect(projectOwner).withdrawAmountRaised(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'InvestmentNotReachedSoftcap');

      const amount = 1000000000000000000n;

      await launchpad
        .connect(address3)
        .invest(mockERC20.target, { value: amount });

      await launchpad
        .connect(projectOwner)
        .withdrawAmountRaised(mockERC20.target);

      expect(await ethers.provider.getBalance(launchpad.target)).to.be.eq(
        (amount * liquidityPercentEth) / BPS,
      );
    });
  });

  describe('Project Cancellation Test Cases', function () {
    it('Should revert if caller is not launchpad admin', async function () {
      const { launchpad, mockERC20, otherAccount, listingTx } =
        await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await expect(
        launchpad.connect(otherAccount).cancelProject(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'NotLaunchpadAdmin');
    });

    it('Should cancel and send the tokens to the project owner successfully', async function () {
      const {
        launchpad,
        mockERC20,
        address2,
        listingTx,
        launchpadadmin,
        projectOwner,
      } = await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      const Invest = await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      Invest.wait();

      const Cancel = await launchpad
        .connect(launchpadadmin)
        .cancelProject(mockERC20.target);

      await Cancel.wait();

      const OwnerBalanceAfterCancellation = await mockERC20.balanceOf(
        projectOwner.address,
      );

      expect(OwnerBalanceAfterCancellation).to.be.equal(
        10000000000000000000000n,
      );

      const WithdrawAmountGottenSofar = await launchpad
        .connect(projectOwner)
        .withdrawAmountRaised(mockERC20.target);
      WithdrawAmountGottenSofar.wait();
    });
  });

  describe('Launchpad Admin Change Test Case', function () {
    it('Should revert when contract is paused', async function () {
      const { launchpad, address2, listingTx } = await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await expect(
        launchpad.connect(address2).changeLaunchpadAdmin(address2.address),
      ).to.be.reverted;
    });

    it('Should revert if caller is not launchpad admin', async function () {
      const { launchpad, address3 } = await loadFixture(deployLaunchpad);

      await expect(
        launchpad.connect(address3).changeLaunchpadAdmin(address3.address),
      ).to.be.revertedWithCustomError(launchpad, 'NotLaunchpadAdmin');
    });

    it('Should revert if the inputed address is the same as the current launchpad admin address', async function () {
      const { launchpadadmin, launchpad } = await loadFixture(deployLaunchpad);

      await expect(
        launchpad
          .connect(launchpadadmin)
          .changeLaunchpadAdmin(launchpadadmin.address),
      ).to.be.revertedWithCustomError(launchpad, 'OldAdmin');
    });

    it('Should set the new launchpad admin successfully', async function () {
      const { launchpadadmin, launchpad, address3 } = await loadFixture(
        deployLaunchpad,
      );

      const SetNewAdmin = await launchpad
        .connect(launchpadadmin)
        .changeLaunchpadAdmin(address3.address);
      SetNewAdmin.wait();

      expect(await launchpad.launchpadAdmin()).to.be.equal(address3.address);
    });
  });

  describe('When launchpad is paused', function () {
    it('Should revert if caller is not launchpad admin', async function () {
      const { launchpad, address2, launchpadadmin } = await loadFixture(
        deployLaunchpad,
      );

      await expect(
        launchpad.connect(address2).pause(),
      ).to.be.revertedWithCustomError(launchpad, 'NotLaunchpadAdmin');
    });
  });

  describe('Create pool Test Case', async function () {
    it('Should revert if caller is not an project owner', async function () {
      const { launchpad, listingTx, mockERC20, address2, address3 } =
        await listProject({});

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await expect(
        launchpad.connect(address3).createPoolAndAddLiquidity(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
    });

    it('Should revert if project is not ended yet', async function () {
      const { launchpad, listingTx, mockERC20, address2, projectOwner } =
        await listProject({ minInvestment: 10000000000n });

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 10000000000n });

      await expect(
        launchpad
          .connect(projectOwner)
          .createPoolAndAddLiquidity(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'ProjectIsNotEndedYet');
    });

    it('should create pool and add liquidity successfull', async function () {
      const { launchpad, listingTx, mockERC20, projectOwner, address4 } =
        await listProject({});
      const amount = 1000000000000000000n;
      const LaunchProject = await listingTx;
      LaunchProject.wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address4)
        .invest(mockERC20.target, { value: amount });

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime() + minimumDuration,
      ]);

      await launchpad
        .connect(projectOwner)
        .createPoolAndAddLiquidity(mockERC20.target);

      const projectPoolData = await launchpad.projectPoolData(mockERC20.target);

      const positionManagerContract = await ethers.getContractAt(
        ERC721ABI,
        positionManager,
        projectOwner,
      );

      const ownerOfPool = await positionManagerContract.ownerOf(
        projectPoolData[1],
      );

      expect(ownerOfPool).to.be.eq(projectOwner.address);
    });
  });

  describe('EmergencyInvestmentWithdrawal Function Test cases', function () {
    it('Should revert if the caller has no investment', async function () {
      const { launchpad, mockERC20, listingTx, address2 } = await listProject(
        {},
      );

      await (await listingTx).wait();
      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await expect(
        launchpad
          .connect(address2)
          .EmergencyInvestmentWithdrawal(mockERC20.target),
      ).to.be.revertedWithCustomError(launchpad, 'YouAreNotAnInvestor');
    });

    it('Should withdraw the correct amount after applying the penalty', async function () {
      const { launchpad, mockERC20, listingTx, address2, projectOwner } =
        await listProject({});
      await (await listingTx).wait();

      await launchpad
        .connect(projectOwner)
        .setEmergencyWithdrawalPercent(mockERC20.target, 1000);

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 10000000000000000000n });

      const initialBalance = await ethers.provider.getBalance(address2.address);

      await launchpad
        .connect(address2)
        .EmergencyInvestmentWithdrawal(mockERC20.target);

      const finalBalance = await ethers.provider.getBalance(address2.address);
      const penalty = (10000000000000000000n * 1000n) / 10000n;
      const expectedWithdrawal = 10000000000000000000n - penalty;

      expect(Number(ethers.formatEther(finalBalance)).toFixed(0)).to.be.eq(
        Number(ethers.formatEther(initialBalance + expectedWithdrawal)).toFixed(
          0,
        ),
      );
    });

    it('Should reset the investor’s projectInvestment after withdrawal', async function () {
      const { launchpad, mockERC20, listingTx, address2 } = await listProject(
        {},
      );
      await (await listingTx).wait();

      await network.provider.send('evm_setNextBlockTimestamp', [
        getCurrentTime(),
      ]);

      await launchpad
        .connect(address2)
        .invest(mockERC20.target, { value: 1000000000000000000n });

      await launchpad
        .connect(address2)
        .EmergencyInvestmentWithdrawal(mockERC20.target);

      const investmentAfterWithdrawal = await launchpad.projectInvestments(
        mockERC20.target,
        address2.address,
      );
      expect(investmentAfterWithdrawal).to.be.equal(0);
    });
  });

  describe('setTime Function Test cases', function () {
    it('Should revert if the caller is not the project owner', async function () {
      const { launchpad, mockERC20, listingTx, address2 } = await listProject(
        {},
      );
      await (await listingTx).wait();

      await expect(
        launchpad
          .connect(address2)
          .setTime(mockERC20.target, getCurrentTime() + 1000, 86400),
      ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
    });

    it('Should revert if the start time is in the past', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({ duration: 0, startTime: 0 });
      await (await listingTx).wait();

      await expect(
        launchpad
          .connect(projectOwner)
          .setTime(mockERC20.target, getCurrentTime() - 100000, 86400),
      ).to.be.revertedWithCustomError(launchpad, 'StartTimeMustBeInFuture');
    });

    it('Should revert if the duration is less than 5 minutes', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({ duration: 0, startTime: 0 });
      await (await listingTx).wait();

      await expect(
        launchpad
          .connect(projectOwner)
          .setTime(mockERC20.target, getCurrentTime() + 1000, 240),
      ).to.be.revertedWithCustomError(
        launchpad,
        'DurationShouldBeAtleastOneDay',
      );
    });

    it('Should update the project start and end time correctly', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({ duration: 0, startTime: 0 });
      await (await listingTx).wait();

      const startTime = getCurrentTime() + 1000;
      const duration = 86400;

      await launchpad
        .connect(projectOwner)
        .setTime(mockERC20.target, startTime, duration);

      const project = await launchpad.getProjectDetails(mockERC20.target);
      expect(project.startTime).to.be.equal(startTime);
      expect(project.endTime).to.be.equal(startTime + duration);
    });

    it('Should emit ProjectTimeUpdated event', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({ duration: 0, startTime: 0 });
      await (await listingTx).wait();

      const startTime = getCurrentTime() + 1000;
      const duration = 86400;

      await expect(
        launchpad
          .connect(projectOwner)
          .setTime(mockERC20.target, startTime, duration),
      )
        .to.emit(launchpad, 'ProjectTimeUpdated')
        .withArgs(startTime, startTime + duration);
    });
  });

  describe('setEmergencyWithdrawalPercent Function Test cases', function () {
    it('Should revert if the caller is not the project owner', async function () {
      const { launchpad, mockERC20, listingTx, address2, address3 } =
        await listProject({});
      await (await listingTx).wait();

      await expect(
        launchpad
          .connect(address2)
          .setEmergencyWithdrawalPercent(mockERC20.target, 500),
      ).to.be.revertedWithCustomError(launchpad, 'NotProjectOwner');
    });

    it('Should revert if the percentage is greater than 1000 (10%)', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({});
      await (await listingTx).wait();

      await expect(
        launchpad
          .connect(projectOwner)
          .setEmergencyWithdrawalPercent(mockERC20.target, 1500),
      ).to.be.revertedWith('percentage should be less than 10');
    });

    it('Should set the emergency withdrawal penalty percentage correctly', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({});
      await (await listingTx).wait();

      const percentage = 500;

      await launchpad
        .connect(projectOwner)
        .setEmergencyWithdrawalPercent(mockERC20.target, percentage);

      const project = await launchpad.getProjectDetails(mockERC20.target);
      expect(project.emergencyWithrawalPenaltyPercent).to.be.equal(percentage);
    });

    it('Should allow setting the percentage to zero', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({});
      await (await listingTx).wait();

      const percentage = 0;

      await launchpad
        .connect(projectOwner)
        .setEmergencyWithdrawalPercent(mockERC20.target, percentage);

      const project = await launchpad.getProjectDetails(mockERC20.target);
      expect(project.emergencyWithrawalPenaltyPercent).to.be.equal(percentage);
    });

    it('Should emit an event when the percentage is set', async function () {
      const { launchpad, mockERC20, listingTx, projectOwner } =
        await listProject({});
      await (await listingTx).wait();

      const percentage = 300;

      await expect(
        launchpad
          .connect(projectOwner)
          .setEmergencyWithdrawalPercent(mockERC20.target, percentage),
      )
        .to.emit(launchpad, 'EmergencyWithdrawalPercentUpdated')
        .withArgs(mockERC20.target, percentage);
    });
  });
});
