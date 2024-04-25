//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ERC20Hodl is ReentrancyGuard {
    uint256 id;
    struct Details {
        uint256 unlockTime;
        uint256 lockedTime;
        address owner;
        address tokenAddress;
        uint256 amount;
        bool withdrawn;
    }
    mapping(uint256 => Details) public lockups;
    mapping(address => uint256[]) public depositIds;
    event Deposited(
        uint256 id,
        uint256 unlockTime,
        uint256 lockedTime,
        address owner,
        address tokenAddress,
        uint256 amount,
        bool withdrawn
    );
    event Withdrawn(uint256 id, uint256 amount, address tokenAddress);

    /**
     *@dev function deposit in contract
     *@param _duration {uint256} time duration for the token should be locked
     *@param _amount {uint256} amount of the tokens which should be locked
     *@param _tokenAddress {address} contract address of the token
     */

    function deposit(
        uint256 _duration,
        uint256 _amount,
        address _tokenAddress
    ) public {
        require(_amount != 0, "Invalid amount: 0");
        uint256 _unlockTime = block.timestamp + _duration;
        address _owner = msg.sender;

        IERC20(_tokenAddress).transferFrom(_owner, address(this), _amount);

        lockups[++id] = Details({
            lockedTime: block.timestamp,
            unlockTime: _unlockTime,
            owner: _owner,
            tokenAddress: _tokenAddress,
            amount: _amount,
            withdrawn: false
        });

        depositIds[msg.sender].push(id);

        emit Deposited(
            id,
            _unlockTime,
            block.timestamp,
            _owner,
            _tokenAddress,
            _amount,
            lockups[id].withdrawn
        );
    }

    /**
     *@dev function withdraw in contract
     *@param _id {uint256} lockup id which points to particular lockup
     */
    function withdraw(uint256 _id) public nonReentrant {
        Details memory _lockups = lockups[_id];

        require(!_lockups.withdrawn, "Already Withdrawn");
        require(msg.sender == _lockups.owner, "Unauthorized Access");
        require(
            block.timestamp >= _lockups.unlockTime,
            "You can't withdraw tokens before unlocktime"
        );
        lockups[_id].withdrawn = true;

        IERC20(_lockups.tokenAddress).transfer(msg.sender, _lockups.amount);
        emit Withdrawn(_id, _lockups.amount, _lockups.tokenAddress);
    }
}
