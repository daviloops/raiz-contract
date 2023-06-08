// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Staking is Ownable {
    mapping(address => uint256) public stakingBalances;
    mapping(address => uint256) public timeStaked;
    address[] public stakers;
    IERC20 private immutable _asset;
    uint256 public totalStaked;

    uint256 public minStake;
    uint256 public minStakeTime;
    uint256 public maxStakeDuration; 

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    // Todo: check this payable in constructor
    constructor(IERC20 asset_) {
        _asset = asset_;
        totalStaked = 0;
        minStake = 0;
        minStakeTime = 0 days;
        maxStakeDuration = 3650 days; // 10 years
    }

    function stake(uint256 _amount) public payable {
        require(_amount >= minStake, "Staking amount is not over the minimum");
        require(_amount > 0, "amount cannot be 0");

        //User adding test tokens
        _asset.transferFrom(msg.sender, address(this), _amount);
        totalStaked += _amount;

        stakingBalances[msg.sender] += _amount;
        timeStaked[msg.sender] = block.timestamp;

        emit Staked(msg.sender, _amount);
    }

    // function unstakeTokens() public {
    //     uint256 balance = stakingBalances[msg.sender];

    //     require(balance > 0, "amount has to be more than 0");

    //     testToken.transfer(msg.sender, balance);
    //     totalStaked -= balance;

    //     stakingBalances[msg.sender] = 0;

    //     //updating staking status
    //     isStakingAtm[msg.sender] = false;
    // }

    // function unstake() {

    //     stakingBalances[msg.sender] = 0;
    // }

    function balanceOf(address user) public view returns (uint256) {
        return stakingBalances[user];
    }
}