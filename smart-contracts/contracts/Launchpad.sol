// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Launchpad is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    ///////////////EVENTS//////////////////
    /**
     * @dev Emits when a new project is listed on the launchpad with its details
     */
    event ProjectListed(
        uint256 indexed projectId,
        address indexed projectOwner,
        address indexed token,
        // uint256 tokenPrice,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 maxCap, //IDO totalsupply
        uint256 endTimeInMinutes
    );

    /**
     * @dev Emits when an investor/project participant makes an investment/contribution in a particular IDO project
     */
    event InvestmentMade(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amountInvested
    );

    event Swept(address to, uint256 value);

    /////////////////STATE VARIABLES///////////////////
    address public launchPadadmin;

    uint256 projectsCurrentId;

    struct IDOProject {
        address projectOwner;
        IERC20 token;
        uint256 tokenPrice;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 maxCap;
        uint256 softCap; //IDO totalSupply
        uint256 hardCap;
        uint256 liquidityPercentToken;
        uint256 liquidityPercentEth;
        uint256 startTime;
        uint256 IDOduration;
        bool isActive;
        uint256 totalAmountRaised;
        uint256 totalTokenIDOClaimed;
        address[] whiteListedAddresses;
        address[] projectInvestors;
        bool withdrawn;
    }

    //Tracks the investment amount of each participant for a specific project
    mapping(uint256 => mapping(address => uint256)) projectInvestments;
    //Keeps track of whitelisted tokens for the launchpad
    mapping(address => bool) tokenListed;
    //tracks whether a participant has already claimed their allocated tokens
    mapping(uint256 => mapping(address => bool)) claimed;

    // The allocation of a particular IDO for each participant
    mapping(uint256 => mapping(address => uint256)) allocation;

    mapping(uint256 => mapping(address => bool)) private whitelistedAddresses;

    mapping(uint256 => IDOProject) projects;

    ///////////////ERRORS//////////////////
    error NotLaunchPadAdmin();
    error TokenPriceMustBeGreaterThanZero();
    error MinimumInvestmentMustBeGreaterThanZero();
    error MaxInvestmentMustBeGreaterOrEqualToMinInvestment();
    error MaxInvestmentShouldBeLessThanOrEqualToHardcap();
    error EndTimeMustBeInFuture();
    error InvalidProjectID();
    error ProjectNotActive();
    error InvestmentAmtBelowMinimum();
    error InvestmentAmtExceedsMaximum();
    error ProjectEnded();
    error NotProjectOwner();
    error AlreadyWithdrawn();
    error ProjectStillInProgress();
    error AddressZero();
    error TxnFailed();
    error TokenAlreadyWhitelisted();
    error ContractNotFullyFunded();
    error EmptyAddress();
    error NotWhiteListed();
    error MaxCapExceeded();
    error TokenAllocationMustBeGreaterThanZero();
    error UserAlreadyWhitelisted();
    error OldAdmin();
    error HardCapReachedNoTokensToSweep();
    error StartTimeMustBeInFuture();
    error ProjectNotStartedYet();
    error SoftcapMustBeLessThanHardcap();
    error LiquidityPercentMustBeInRange51To100();
    error InvestmentNotReachedSoftcap();
    error ProjectIsNotEndedYet();
    error YouAreNotAnInvestor();
    error ClaimedAlready();
    error IneligibleForRefund();
    error InvestmentAmountExceedsHardcap(uint256 _maxInvestmentPossible);

    constructor() {
        launchPadadmin = msg.sender;
    }

    /**
     * @dev function to list a new project with its details
     */

    function listProject(
        IERC20 _token,
        // uint256 _tokenPrice,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _maxCap,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _liquidityPercentToken,
        uint256 _liquidityPercentEth,
        uint256 _startTime,
        uint256 _endTime,
        address[] memory _whiteListedUsers
    ) external whenNotPaused {
        if (_startTime < block.timestamp) revert StartTimeMustBeInFuture();
        // if (_tokenPrice == 0) revert TokenPriceMustBeGreaterThanZero();
        if (_minInvestment == 0)
            revert MinimumInvestmentMustBeGreaterThanZero();
        if (_maxInvestment < _minInvestment)
            revert MaxInvestmentMustBeGreaterOrEqualToMinInvestment();
        // uint256 hardcap=(_tokenPrice*_maxCap).div(10**18);

        if (_softCap >= _hardCap) revert SoftcapMustBeLessThanHardcap();

        if (_maxInvestment > _hardCap)
            revert MaxInvestmentShouldBeLessThanOrEqualToHardcap();

        if (_whiteListedUsers.length == 0) revert EmptyAddress();

        projectsCurrentId = projectsCurrentId + 1;

        for (uint256 i; i < _whiteListedUsers.length; i++) {
            address user = _whiteListedUsers[i];
            if (user == address(0)) revert AddressZero();
            whitelistedAddresses[projectsCurrentId][user] = true;
        }

        IDOProject storage project = projects[projectsCurrentId];

        if (tokenListed[address(_token)] == true)
            revert TokenAlreadyWhitelisted();

        project.projectOwner = msg.sender;
        project.token = _token;
        project.tokenPrice = 0;
        project.minInvestment = _minInvestment;
        project.maxInvestment = _maxInvestment;
        project.maxCap = _maxCap;
        project.softCap = _softCap;
        project.hardCap = _hardCap;
        project.liquidityPercentToken = _liquidityPercentToken;
        project.liquidityPercentEth = _liquidityPercentEth;
        project.startTime = _startTime;
        project.IDOduration = _endTime;
        project.whiteListedAddresses = _whiteListedUsers;
        project.isActive = true;

        tokenListed[address(_token)] = true;

        IERC20(_token).safeTransferFrom(_msgSender(), address(this), _maxCap);
        emit ProjectListed(
            projectsCurrentId,
            msg.sender,
            address(_token),
            // _tokenPrice,
            _minInvestment,
            _maxInvestment,
            _maxCap,
            _endTime
        );
    }

    // function isWhitelisted(
    //     uint256 _projectId,
    //     address _address
    // ) private view returns (bool) {
    //     return whitelistedAddresses[_projectId][_address];
    // }

    function invest(uint256 _projectId) external payable whenNotPaused {
        if (_projectId > projectsCurrentId || _projectId == 0)
            revert InvalidProjectID();

        IDOProject storage project = projects[_projectId];

        if (block.timestamp < project.startTime) revert ProjectNotStartedYet();
        // if (isWhitelisted(_projectId, msg.sender) == false)
        //     revert NotWhiteListed();
        if (project.isActive == false) revert ProjectNotActive();

        // if (IERC20(project.token).balanceOf(address(this)) < project.maxCap)
        //     revert ContractNotFullyFunded();
        if (
            project.totalAmountRaised >= project.hardCap ||
            block.timestamp >= project.IDOduration
        ) revert ProjectEnded();

        // if (block.timestamp > project.IDOduration) revert ProjectEnded();

        if (msg.value < project.minInvestment)
            revert InvestmentAmtBelowMinimum();
        if (
            (projectInvestments[_projectId][msg.sender] + (msg.value)) >
            project.maxInvestment
        ) revert InvestmentAmtExceedsMaximum();

        uint256 investmentAmount = msg.value;

        // Calculate token allocation
        // uint256 tokenAllocation = (investmentAmount.mul(
        //     1e18
        // )  / project.tokenPrice);

        // if (tokenAllocation == 0) revert TokenAllocationMustBeGreaterThanZero();

        // // Ensure token allocation doesn't exceed the maximum cap
        // if (tokenAllocation > project.maxCap) revert MaxCapExceeded();

        // // Deduct the token allocation from the total token supply
        // project.maxCap = project.maxCap.sub(tokenAllocation);

        // allocation[_projectId][msg.sender] = allocation[_projectId][msg.sender]
        //     .add(tokenAllocation);

        // project.totalTokenIDOClaimed = project.totalTokenIDOClaimed.add(
        //     tokenAllocation
        // );

        // // Transfer the allocated tokens to the participant.
        // IERC20(project.token).safeTransfer(_msgSender(), tokenAllocation);
        if (investmentAmount > project.hardCap - (project.totalAmountRaised)) {
            revert InvestmentAmountExceedsHardcap(
                project.hardCap - (project.totalAmountRaised)
            );
        }
        projectInvestments[_projectId][msg.sender] =
            projectInvestments[_projectId][msg.sender] +
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

        whitelistedAddresses[_projectId][msg.sender] = true;

        emit InvestmentMade(
            _projectId,
            msg.sender,
            projectInvestments[_projectId][msg.sender]
        );
    }

    /**
     * @dev Pause the sale
     */
    function pause() external {
        if (msg.sender != launchPadadmin) revert NotLaunchPadAdmin();
        super._pause();
    }

    /**
     * @dev Unpause the sale
     */
    function unpause() external {
        if (msg.sender != launchPadadmin) revert NotLaunchPadAdmin();
        super._unpause();
    }

    function round(
        uint256 number,
        uint256 decimals
    ) private pure returns (uint256) {
        uint256 remainder = number % (10 ** decimals);
        if (remainder >= (5 * 10 ** (decimals - 1))) {
            return number + (10 ** decimals) - remainder;
        } else {
            return number - remainder;
        }
    }

    function claimTokens(uint256 _projectId) external {
        if (_projectId > projectsCurrentId || _projectId == 0)
            revert InvalidProjectID();

        if (!whitelistedAddresses[_projectId][msg.sender])
            revert YouAreNotAnInvestor();

        if (claimed[_projectId][msg.sender]) revert ClaimedAlready();

        IDOProject memory project = projects[_projectId];

        if (project.totalAmountRaised < project.softCap)
            revert InvestmentNotReachedSoftcap();

        if (
            project.totalAmountRaised < project.hardCap &&
            block.timestamp < project.IDOduration
        ) revert ProjectIsNotEndedYet();

        uint256 investmentAmount = projectInvestments[_projectId][msg.sender];

        uint256 airdropPercentToken = (10000 - project.liquidityPercentToken);

        //10**22=10**18*100*100, (100 for percentage in denominator 100 for considering percentage based on 10000 instead of 100)
        uint256 tokenPrice = ((project.totalAmountRaised) * (10 ** 22)) /
            (project.maxCap * (airdropPercentToken));

        uint256 tokenAllocation = (investmentAmount * (10 ** 18)) /
            (round(tokenPrice, 2));

        if (tokenAllocation <= 0) revert YouAreNotAnInvestor();

        claimed[_projectId][msg.sender] = true;
        IERC20(project.token).safeTransfer(_msgSender(), tokenAllocation);
    }

    function refundTokens(uint256 _projectId) external {
        if (_projectId > projectsCurrentId || _projectId == 0)
            revert InvalidProjectID();

        if (claimed[_projectId][msg.sender]) revert ClaimedAlready();

        IDOProject memory project = projects[_projectId];

        if (msg.sender != project.projectOwner) revert NotProjectOwner();
        if (project.totalAmountRaised >= project.softCap)
            revert IneligibleForRefund();
        if (
            project.totalAmountRaised < project.hardCap &&
            block.timestamp < project.IDOduration
        ) revert ProjectIsNotEndedYet();

        claimed[_projectId][msg.sender] = true;
        IERC20(project.token).safeTransfer(_msgSender(), project.maxCap);
    }

    function AddUserForAParticularProject(
        uint256 _projectId,
        address _user
    ) external whenNotPaused {
        if (_projectId > projectsCurrentId || _projectId == 0)
            revert InvalidProjectID();

        IDOProject storage project = projects[_projectId];
        if (msg.sender != project.projectOwner) revert NotProjectOwner();
        if (_user == address(0)) revert AddressZero();
        if (whitelistedAddresses[_projectId][_user] == true)
            revert UserAlreadyWhitelisted();

        whitelistedAddresses[_projectId][_user] = true;
        project.whiteListedAddresses.push(_user);
    }

    //
    /**
     * @dev alternative to Deposit IDO token for investment
     */
    // function depositIDOTokens(
    //     uint256 _projectId,
    //     uint256 amount
    // ) external whenNotPaused {
    //     if (_projectId > projectsCurrentId || _projectId == 0)
    //         revert InvalidProjectID();

    //     IDOProject storage project = projects[_projectId];
    //     if (msg.sender != project.projectOwner) revert NotProjectOwner();

    //     IERC20(project.token).safeTransferFrom(
    //         _msgSender(),
    //         address(this),
    //         amount
    //     );
    // }

    // function getRefundToken(uint256 _projectID) external nonReentrant{
    //     if (_projectID > projectsCurrentId || _projectID == 0)
    //         revert InvalidProjectID();

    //     IDOProject storage project = projects[_projectID];
    //     if (msg.sender != project.projectOwner) revert NotProjectOwner();

    // }
    /**
     * @dev function allows the IDO project owner to withdraw the raised funds after the listing project period ends
     */
    function withdrawAmountRaised(
        uint256 _projectID
    ) external payable whenNotPaused nonReentrant {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();
        IDOProject storage project = projects[_projectID];
        if (project.totalAmountRaised < project.softCap)
            revert InvestmentNotReachedSoftcap();
        if (msg.sender != project.projectOwner) revert NotProjectOwner();
        if (project.withdrawn == true) revert AlreadyWithdrawn();

        if (
            project.totalAmountRaised < project.hardCap &&
            block.timestamp < project.IDOduration
        ) revert ProjectStillInProgress();

        uint256 withdrawablePercentEth = 10000 - project.liquidityPercentEth;
        uint256 withdrawableAmount = (project.totalAmountRaised *
            (withdrawablePercentEth)) / (10000);

        project.totalAmountRaised = 0;
        project.withdrawn = true;
        (bool success, ) = payable(msg.sender).call{value: withdrawableAmount}(
            ""
        );
        if (!success) revert TxnFailed();
    }

    function changeLaunchPadAdmin(address _newAdmin) external whenNotPaused {
        if (msg.sender != launchPadadmin) revert NotLaunchPadAdmin();
        if (_newAdmin == address(0)) revert AddressZero();
        if (_newAdmin == launchPadadmin) revert OldAdmin();
        launchPadadmin = _newAdmin;
    }

    function getIDOTokenBalanceInLaunchPad(
        uint256 projectId
    ) public view returns (uint256) {
        if (projectId > projectsCurrentId || projectId == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[projectId];
        return IERC20(project.token).balanceOf(address(this));
    }

    function getTokenLeftForAParticularIDO(
        uint256 projectId
    ) public view returns (uint256) {
        if (projectId > projectsCurrentId || projectId == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[projectId];
        uint256 tokenLeft = project.maxCap - (project.totalTokenIDOClaimed);

        return tokenLeft;
    }

    function sweep(uint256 _projectID, address to) external whenNotPaused {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();
        IDOProject memory project = projects[_projectID];

        if (msg.sender != project.projectOwner) revert NotProjectOwner();
        if (to == address(0)) revert AddressZero();

        if (project.totalAmountRaised >= project.hardCap)
            revert HardCapReachedNoTokensToSweep();
        if (block.timestamp < project.IDOduration)
            revert ProjectStillInProgress();

        uint256 balance = getIDOTokenBalanceInLaunchPad(_projectID);
        IERC20(project.token).safeTransfer(to, balance);

        emit Swept(to, balance);
    }

    function getInvestorsForAParticularProject(
        uint256 _projectID
    ) external view returns (address[] memory) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[_projectID];
        return project.projectInvestors;
    }

    function getUserInvestmentForAnIDOInCELO(
        uint256 _projectID,
        address _i
    ) external view returns (uint256) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();
        return projectInvestments[_projectID][_i];
    }

    function getAUserAllocationForAProject(
        uint256 _projectID,
        address userAddr
    ) external view returns (uint256) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();

        return allocation[_projectID][userAddr];
    }

    function cancelIDOProject(uint256 _projectId) external {
        if (msg.sender != launchPadadmin) revert NotLaunchPadAdmin();
        if (_projectId > projectsCurrentId || _projectId == 0)
            revert InvalidProjectID();

        IDOProject storage project = projects[_projectId];
        project.isActive = false;
        project.IDOduration = 0;
        address to = project.projectOwner;

        uint256 balance = getIDOTokenBalanceInLaunchPad(_projectId);
        IERC20(project.token).safeTransfer(to, balance);
    }

    function getProjectDetails(
        uint256 _projectID
    ) external view returns (IDOProject memory) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();
        return projects[_projectID];
    }

    // function getProjectPrice(
    //     uint256 _projectID
    // ) external view returns (uint256) {
    //     if (_projectID > projectsCurrentId || _projectID == 0)
    //         revert InvalidProjectID();

    //     IDOProject memory project = projects[_projectID];
    //     return project.tokenPrice;
    // }

    function getProjectMaxCap(
        uint256 _projectID
    ) external view returns (uint256) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[_projectID];
        return project.maxCap;
    }

    function getProjectTotalAmtRaised(
        uint256 _projectID
    ) external view returns (uint256) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[_projectID];
        return project.totalAmountRaised;
    }

    function getProjectTotalTokenIDOClaimed(
        uint256 _projectID
    ) external view returns (uint256) {
        if (_projectID > projectsCurrentId || _projectID == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[_projectID];
        return project.totalTokenIDOClaimed;
    }

    function getTimeLeftForAParticularProject(
        uint256 projectId
    ) public view returns (uint256) {
        if (projectId > projectsCurrentId || projectId == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[projectId];

        if (block.timestamp >= project.IDOduration) {
            return 0; // IDOProject has ended
        } else {
            uint256 timeLeftInSeconds = project.IDOduration - block.timestamp;
            uint256 timeLeftInMinutes = timeLeftInSeconds / 60; // Convert seconds to minutes
            return timeLeftInMinutes;
        }
    }

    function getCurrentProjectID() external view returns (uint256) {
        return projectsCurrentId;
    }

    ///@dev function to get contract balance
    function getContractBal() external view returns (uint256) {
        return address(this).balance;
    }

    function getTotalInvestorsForAParticularProject(
        uint256 projectId
    ) external view returns (uint256) {
        if (projectId > projectsCurrentId || projectId == 0)
            revert InvalidProjectID();

        IDOProject memory project = projects[projectId];
        return project.projectInvestors.length;
    }
}
