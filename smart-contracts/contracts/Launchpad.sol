//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./uniswap-helpers/UniswapFactoryHelper.sol";

contract Launchpad is
    Pausable,
    ReentrancyGuard,
    UniswapFactoryAndPositionManagerHelper
{
    using SafeERC20 for IERC20;
    using Math for uint256;

    // 1% pool fee
    uint24 public constant feeAmount = 100;
    address public factory_contract;
    address public position_manager;
    IWETH public WETH;
    uint24 BPS = 10_000;
    ///////////////EVENTS//////////////////
    /**
     * @dev Emits when a new project is listed on the launchpad with its details
     */
    event ProjectListed(
        address indexed tokenContractAddress,
        address indexed projectOwner,
        uint256 softCap,
        uint256 hardCap,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 tokenMaxCap,
        uint256 endTime,
        uint24 _liquidityPercentEth,
        uint24 _liquidityPercentToken
    );

    event ProjectTimeUpdated(uint256 startTime, uint256 endTime);

    /**
     * @dev Emits when an investor/project participant makes an investment/contribution in a particular IDO project
     */
    event InvestmentMade(
        address indexed tokenContractAddress,
        address indexed investor,
        uint256 amountInvested
    );

    event PoolCreated(
        address projectToken,
        address pool,
        uint256 postionMintId
    );

    event EmergencyWithdrawalPercentUpdated(
        address tokenContractAddress,
        uint24 percentage
    );

    /////////////////STATE VARIABLES///////////////////
    address public launchpadAdmin;
    uint256 projectsCurrentId;

    struct Project {
        address projectOwner;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 tokenMaxCap;
        uint256 softCap; //IDO totalSupply
        uint256 hardCap;
        uint256 startTime;
        uint256 endTime;
        uint256 totalAmountRaised;
        uint256 totalTokenClaimed;
        uint24 liquidityPercentToken;
        uint24 liquidityPercentEth;
        bool isActive;
        bool withdrawn;
        IERC20 token;
        address[] projectInvestors;
        uint24 emergencyWithrawalPenaltyPercent;
    }

    struct ProjectPool {
        address pool;
        uint256 positionMintId;
    }

    //Tracks the investment amount of each participant for a specific project
    mapping(address => mapping(address => uint256)) public projectInvestments;

    //tracks whether a participant has already claimed their allocated tokens
    mapping(address => mapping(address => bool)) claimed;

    mapping(address => Project) projects;
    mapping(address => ProjectPool) public projectPoolData;

    ///////////////ERRORS//////////////////
    error NotLaunchpadAdmin();
    error MinimumInvestmentMustBeGreaterThanZero();
    error MaxInvestmentMustBeGreaterOrEqualToMinInvestment();
    error MaxInvestmentShouldBeLessThanOrEqualToHardcap();
    error InvalidTokenContractAddress();
    error ProjectNotActive();
    error InvestmentAmtBelowMinimum();
    error InvestmentAmtExceedsMaximum();
    error ProjectEnded();
    error NotProjectOwner();
    error AlreadyWithdrawn();
    error ProjectStillInProgress();
    error AddressZero();
    error TxnFailed();
    error TokenAllocationMustBeGreaterThanZero();
    error OldAdmin();
    error StartTimeMustBeInFuture();
    error DurationShouldBeAtleastOneDay();
    error ProjectNotStartedYet();
    error SoftcapMustBeLessThanHardcap();
    error InvestmentNotReachedSoftcap();
    error ProjectIsNotEndedYet();
    error YouAreNotAnInvestor();
    error ClaimedAlready();
    error IneligibleForRefund();
    error InvestmentAmountExceedsHardcap(uint256 _maxInvestmentPossible);
    error ProjectIsAlreadyInitializedOrActive();

    constructor(
        address _uniswapFactory,
        address _uniswapPositionManager,
        address _wethAddress
    ) {
        launchpadAdmin = msg.sender;
        WETH = IWETH(_wethAddress);
        position_manager = (_uniswapPositionManager);
        factory_contract = (_uniswapFactory);
    }

    /**
     * @dev function to list a new project with its details
     */

    modifier OnlyLaunchpadAdmin() {
        if (msg.sender != launchpadAdmin) revert NotLaunchpadAdmin();
        _;
    }

    modifier onlyProjectOwner(address _tokenContractAddress) {
        if (msg.sender != projects[_tokenContractAddress].projectOwner)
            revert NotProjectOwner();
        _;
    }

    modifier validateToken(address _tokenContractAddress) {
        if (_tokenContractAddress == address(0))
            revert InvalidTokenContractAddress();
        _;
    }

    modifier validateProjectExpiry(address _tokenContractAddress) {
        Project memory project = projects[_tokenContractAddress];

        if (project.isActive == false) revert ProjectNotActive();
        if (
            project.totalAmountRaised < project.hardCap &&
            block.timestamp < project.endTime
        ) revert ProjectIsNotEndedYet();
        _;
    }

    function listProject(
        IERC20 _token,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _tokenMaxCap,
        uint256 _softCap,
        uint256 _hardCap,
        uint24 _liquidityPercentToken,
        uint24 _liquidityPercentEth,
        uint256 _startTime,
        uint256 _duration
    ) external validateToken(address(_token)) whenNotPaused {
        // Validate inputs
        if (projects[address(_token)].token == _token)
            revert ProjectIsAlreadyInitializedOrActive();
        if (_minInvestment == 0)
            revert MinimumInvestmentMustBeGreaterThanZero();
        if (_maxInvestment < _minInvestment)
            revert MaxInvestmentMustBeGreaterOrEqualToMinInvestment();
        if (_softCap >= _hardCap) revert SoftcapMustBeLessThanHardcap();
        if (_maxInvestment > _hardCap)
            revert MaxInvestmentShouldBeLessThanOrEqualToHardcap();

        _token.safeTransferFrom(msg.sender, address(this), _tokenMaxCap); //totalTokens / 100

        // Initialize project
        Project storage project = projects[address(_token)];
        project.projectOwner = msg.sender;
        project.token = _token;
        project.minInvestment = _minInvestment;
        project.maxInvestment = _maxInvestment;
        project.tokenMaxCap = _tokenMaxCap;
        project.softCap = _softCap;
        project.hardCap = _hardCap;
        project.liquidityPercentToken = _liquidityPercentToken;
        project.liquidityPercentEth = _liquidityPercentEth;

        if (_startTime != 0 || _duration != 0)
            setTime(address(_token), _startTime, _duration);

        emit ProjectListed(
            address(_token),
            msg.sender,
            _softCap,
            _hardCap,
            _minInvestment,
            _maxInvestment,
            _tokenMaxCap,
            _startTime + _duration,
            _liquidityPercentEth,
            _liquidityPercentToken
        );
    }

    function setTime(
        address _tokenContractAddress,
        uint256 _startTime,
        uint256 _duration
    ) public onlyProjectOwner(_tokenContractAddress) {
        Project storage project = projects[_tokenContractAddress];

        if (project.isActive == true)
            revert ProjectIsAlreadyInitializedOrActive();
        if (_startTime < block.timestamp) revert StartTimeMustBeInFuture();
        if (_duration < 5 * 60) revert DurationShouldBeAtleastOneDay();

        project.isActive = true;
        project.startTime = _startTime;
        project.endTime = _startTime + _duration;

        emit ProjectTimeUpdated(_startTime, _startTime + (_duration));
    }

    function invest(
        address _tokenContractAddress
    ) external payable validateToken(_tokenContractAddress) whenNotPaused {
        Project storage project = projects[_tokenContractAddress];

        if (project.isActive == false) revert ProjectNotActive();

        if (block.timestamp < project.startTime) revert ProjectNotStartedYet();
        if (
            project.totalAmountRaised >= project.hardCap ||
            block.timestamp >= project.endTime
        ) revert ProjectEnded();

        if (msg.value < project.minInvestment)
            revert InvestmentAmtBelowMinimum();
        if (
            (projectInvestments[_tokenContractAddress][msg.sender] +
                (msg.value)) > project.maxInvestment
        ) revert InvestmentAmtExceedsMaximum();

        uint256 investmentAmount = msg.value;

        if (investmentAmount > project.hardCap - (project.totalAmountRaised)) {
            revert InvestmentAmountExceedsHardcap(
                project.hardCap - (project.totalAmountRaised)
            );
        }
        projectInvestments[_tokenContractAddress][msg.sender] =
            projectInvestments[_tokenContractAddress][msg.sender] +
            (investmentAmount);
        project.totalAmountRaised =
            project.totalAmountRaised +
            (investmentAmount);

        bool alreadyInvestor = false;
        for (uint256 i; i < project.projectInvestors.length; i++) {
            if (project.projectInvestors[i] == msg.sender) {
                alreadyInvestor = true;
                break;
            }
        }

        if (!alreadyInvestor) {
            project.projectInvestors.push(msg.sender);
        }

        emit InvestmentMade(
            _tokenContractAddress,
            msg.sender,
            projectInvestments[_tokenContractAddress][msg.sender]
        );
    }

    function claimTokens(
        address _tokenContractAddress
    )
        external
        validateToken(_tokenContractAddress)
        validateProjectExpiry(_tokenContractAddress)
    {
        if (claimed[_tokenContractAddress][msg.sender]) revert ClaimedAlready();

        Project storage project = projects[_tokenContractAddress];
        if (project.totalAmountRaised < project.softCap)
            revert InvestmentNotReachedSoftcap();

        uint256 investmentAmount = projectInvestments[_tokenContractAddress][
            msg.sender
        ];
        if (investmentAmount == 0) revert YouAreNotAnInvestor();

        uint256 airdropPercentToken = BPS - project.liquidityPercentToken;
        uint256 adjustedTokenMaxCap = (project.tokenMaxCap *
            airdropPercentToken) / BPS;
        uint256 tokenAllocation = (investmentAmount * adjustedTokenMaxCap) /
            project.totalAmountRaised;

        if (tokenAllocation == 0) revert YouAreNotAnInvestor();

        claimed[_tokenContractAddress][msg.sender] = true;
        project.totalTokenClaimed += tokenAllocation;
        IERC20(project.token).safeTransfer(msg.sender, tokenAllocation);
    }

    function refundTokens(
        address _tokenContractAddress
    )
        external
        validateToken(_tokenContractAddress)
        onlyProjectOwner(_tokenContractAddress)
        validateProjectExpiry(_tokenContractAddress)
    {
        Project storage project = projects[_tokenContractAddress];
        if (project.totalAmountRaised >= project.softCap)
            revert IneligibleForRefund();
        if (project.withdrawn) revert AlreadyWithdrawn();

        IERC20(project.token).safeTransfer(_msgSender(), project.tokenMaxCap);
        project.withdrawn = true;
    }

    function getRefund(
        address _tokenContractAddress
    )
        external
        validateToken(_tokenContractAddress)
        validateProjectExpiry(_tokenContractAddress)
    {
        if (projectInvestments[_tokenContractAddress][msg.sender] == 0)
            revert YouAreNotAnInvestor();
        Project storage project = projects[_tokenContractAddress];
        if (project.totalAmountRaised >= project.softCap)
            revert IneligibleForRefund();

        uint256 refundableInvestment = projectInvestments[
            _tokenContractAddress
        ][msg.sender];
        projectInvestments[_tokenContractAddress][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{
            value: refundableInvestment
        }("");
        if (!success) revert TxnFailed();
    }

    function withdrawAmountRaised(
        address _tokenContractAddress
    )
        external
        payable
        validateToken(_tokenContractAddress)
        onlyProjectOwner(_tokenContractAddress)
        whenNotPaused
        nonReentrant
    {
        Project storage project = projects[_tokenContractAddress];
        if (project.totalAmountRaised < project.softCap)
            revert InvestmentNotReachedSoftcap();
        if (project.withdrawn) revert AlreadyWithdrawn();
        if (
            project.totalAmountRaised < project.hardCap &&
            block.timestamp < project.endTime
        ) revert ProjectStillInProgress();

        uint256 withdrawablePercentEth = BPS - project.liquidityPercentEth;
        uint256 withdrawableAmount = (project.totalAmountRaised *
            withdrawablePercentEth) / BPS;

        project.totalAmountRaised = 0;
        project.withdrawn = true;

        (bool success, ) = payable(msg.sender).call{value: withdrawableAmount}(
            ""
        );
        if (!success) revert TxnFailed();
    }

    function createPoolAndAddLiquidity(
        address _tokenContractAddress
    )
        external
        onlyProjectOwner(_tokenContractAddress)
        validateProjectExpiry(_tokenContractAddress)
    {
        require(
            projectPoolData[_tokenContractAddress].pool == address(0),
            "Pool Already created"
        );

        Project memory project = projects[_tokenContractAddress];

        if (project.totalAmountRaised < project.softCap)
            revert InvestmentNotReachedSoftcap();

        uint256 liquidityEthAmount = (project.totalAmountRaised *
            project.liquidityPercentEth) / BPS;
        uint256 liquidityTokenAmount = (project.tokenMaxCap *
            project.liquidityPercentToken) / BPS;

        require(
            address(this).balance >= liquidityEthAmount,
            "Insufficient ETH in contract"
        );
        require(
            IERC20(_tokenContractAddress).balanceOf(address(this)) >=
                liquidityTokenAmount,
            "Insufficient token balance in contract"
        );

        uint160 sqrtPriceX96;
        if (_tokenContractAddress < address(WETH)) {
            sqrtPriceX96 = uint160(
                (Math.sqrt(liquidityEthAmount) * 2 ** 96) /
                    Math.sqrt(liquidityTokenAmount)
            );
        } else {
            sqrtPriceX96 = uint160(
                (Math.sqrt(liquidityTokenAmount) * 2 ** 96) /
                    Math.sqrt(liquidityEthAmount)
            );
        }

        address pool = createAndInitializePool(
            factory_contract,
            _tokenContractAddress,
            address(WETH),
            feeAmount,
            sqrtPriceX96
        );

        WETH.deposit{value: liquidityEthAmount}();

        uint256 mintId = addLiquidity(
            position_manager,
            _tokenContractAddress,
            liquidityTokenAmount,
            address(WETH),
            liquidityEthAmount,
            feeAmount
        );

        projectPoolData[_tokenContractAddress] = ProjectPool(pool, mintId);
        emit PoolCreated(_tokenContractAddress, pool, mintId);
    }

    function EmergencyInvestmentWithdrawal(
        address _tokenContractAddress
    ) external validateToken(_tokenContractAddress) {
        mapping(address => uint256)
            storage projectInvestment = projectInvestments[
                _tokenContractAddress
            ];
        Project storage project = projects[_tokenContractAddress];
        if (projectInvestment[msg.sender] == 0) revert YouAreNotAnInvestor();

        uint256 withdrawalValue = projectInvestment[msg.sender] -
            (projectInvestment[msg.sender] *
                (project.emergencyWithrawalPenaltyPercent)) /
            BPS;
        (bool success, ) = payable(msg.sender).call{value: withdrawalValue}("");

        if (!success) revert TxnFailed();
        projectInvestment[msg.sender] = 0;
        project.totalAmountRaised -= withdrawalValue;
    }

    function setEmergencyWithdrawalPercent(
        address _tokenContractAddress,
        uint24 _percentage
    ) external onlyProjectOwner(_tokenContractAddress) {
        require(_percentage <= 1000, "percentage should be less than 10");
        Project storage project = projects[_tokenContractAddress];
        project.emergencyWithrawalPenaltyPercent = _percentage;
        emit EmergencyWithdrawalPercentUpdated(
            _tokenContractAddress,
            _percentage
        );
    }

    function changeLaunchpadAdmin(
        address _newAdmin
    ) external OnlyLaunchpadAdmin whenNotPaused {
        if (_newAdmin == address(0)) revert AddressZero();
        if (_newAdmin == launchpadAdmin) revert OldAdmin();
        launchpadAdmin = _newAdmin;
    }

    function getTokenBalanceInLaunchPad(
        address _tokenContractAddress
    ) public view returns (uint256) {
        Project memory project = projects[_tokenContractAddress];
        return IERC20(project.token).balanceOf(address(this));
    }

    function getTokenLeft(
        address _tokenContractAddress
    ) public view validateToken(_tokenContractAddress) returns (uint256) {
        Project memory project = projects[_tokenContractAddress];
        uint256 tokenLeft = project.tokenMaxCap - (project.totalTokenClaimed);

        return tokenLeft;
    }

    function getInvestorsForAParticularProject(
        address _tokenContractAddress
    )
        external
        view
        validateToken(_tokenContractAddress)
        returns (address[] memory)
    {
        Project memory project = projects[_tokenContractAddress];
        return project.projectInvestors;
    }

    function cancelProject(
        address _tokenContractAddress
    ) external OnlyLaunchpadAdmin validateToken(_tokenContractAddress) {
        Project storage project = projects[_tokenContractAddress];
        if (project.isActive == false) revert ProjectNotActive();
        project.isActive = false;
        project.endTime = 0;
        address to = project.projectOwner;

        uint256 balance = IERC20(project.token).balanceOf(address(this));
        IERC20(project.token).safeTransfer(to, balance);
    }

    function getProjectTotalAmtRaised(
        address _tokenContractAddress
    ) external view validateToken(_tokenContractAddress) returns (uint256) {
        Project memory project = projects[_tokenContractAddress];
        return project.totalAmountRaised;
    }

    function getProjectTotalTokenClaimed(
        address _tokenContractAddress
    ) external view validateToken(_tokenContractAddress) returns (uint256) {
        Project memory project = projects[_tokenContractAddress];
        return project.totalTokenClaimed;
    }

    function getTimeLeftForAParticularProject(
        address _tokenContractAddress
    ) public view validateToken(_tokenContractAddress) returns (uint256) {
        Project memory project = projects[_tokenContractAddress];

        if (block.timestamp >= project.endTime) {
            return 0; // Project has ended
        } else {
            uint256 timeLeftInSeconds = project.endTime - block.timestamp;
            uint256 timeLeftInMinutes = timeLeftInSeconds / 60; // Convert seconds to minutes
            return timeLeftInMinutes;
        }
    }

    function getProjectDetails(
        address _tokenContractAddress
    )
        public
        view
        validateToken(_tokenContractAddress)
        returns (Project memory)
    {
        return projects[_tokenContractAddress];
    }

    function getTotalInvestorsForAParticularProject(
        address _tokenContractAddress
    ) external view validateToken(_tokenContractAddress) returns (uint256) {
        Project memory project = projects[_tokenContractAddress];
        return project.projectInvestors.length;
    }

    /**
     * @dev Pause the sale
     */
    function pause() external OnlyLaunchpadAdmin {
        super._pause();
    }

    /**
     * @dev Unpause the sale
     */
    function unpause() external OnlyLaunchpadAdmin {
        super._unpause();
    }
}
