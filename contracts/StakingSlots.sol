// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StakingSlots is Ownable {
    struct Staking {
        // uint256 id;
        address payable staker;
        // string name;
        // string identificationNumber;
        uint256 amount;
        uint256 apy; // Todo: check type
        uint256 duration;
        bool isMature;
        bool isPaid;
        uint256 timestamp;
    }

    IERC20 private immutable _token;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    mapping (uint => Staking) internal stakings;
    uint256 internal stakingsLength = 0;

    // mapping (address => Staking[]) internal userStakings;

    event Stake(address indexed user, uint amount);
    event Unstake();

    event Staked(address indexed user, uint256 amount, uint256 apy, uint256 duration, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor (ERC20 token_) {
        _token = token_;
    }

    function stake(uint256 _amount, uint256 _apy, uint256 _duration) public {
        require(
              IERC20(_token).transferFrom(
                msg.sender,
                address(this),
                _amount
              ),    
              "This transaction could not be performed"
        );

        stakings[stakingsLength] = Staking(
            // stakingsLength,
            payable(msg.sender),
            // _name,
            // _identification,
            _amount,
            _apy,
            _duration,
            false,
            false,
            block.timestamp
        );

        // userStakings[msg.sender].push(staking);
        
        stakingsLength++;
        
        // Is this the same timestamp as the one before?
        emit Staked(msg.sender, _amount, _apy, _duration, block.timestamp);
    }
    
    // Todo: unstake function 
    // function unstake() public {

    // };

    // Todo: improve with admin role
    function getStaking(uint256 _index) public view onlyOwner() returns(
        // uint256,
        address payable,
        // string memory,
        // string memory,
        uint256,
        uint256,
        uint256,
        bool,
        bool,
        uint256
    ){
        Staking storage _staking = stakings[_index];
        return(
            // _staking.id,
            _staking.staker,
            // _staking.name,
            // _staking.identificationNumber,
            _staking.amount,
            _staking.apy,
            _staking.duration,
            _staking.isMature,
            _staking.isPaid,
            _staking.timestamp
        );
    }

    function isStakingMature(uint256 _index) public view onlyOwner() returns (bool) {
        if(block.timestamp > (stakings[_index].timestamp + 2 minutes)){
            return true;
        }
        return false;
    }

    modifier onlyStaker(uint256 _index) {
        require(msg.sender == stakings[_index].staker,"Accessible only to the staker");
        _;
    }

    function payStaker(uint256 _index) public onlyOwner() {
        require(stakings[_index].isPaid == false, "User already paid");
        require(
              IERC20(cUsdTokenAddress).transfer(
                stakings[_index].staker,
                stakings[_index].amount + stakings[_index].duration * stakings[_index].apy // Todo: calculate
              ),    
              "This transaction could not be performed"
        );
        stakings[_index].isPaid = true;
    }

    function unstake(uint256 _index) public onlyStaker(_index) {
        // Todo: allow unstaking before time
        require(isStakingMature(_index) == true, "Stake cannot be collected yet");
        payStaker(_index);

        emit Unstake();
    }

    function isUserOwner(address _address) public view returns (bool) {
        if(_address == address(this)){
            return true;
        }
        return false;
    }
}