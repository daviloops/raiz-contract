// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenizedVault is ERC4626, AccessControl, Ownable {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // constructor(IERC20 _token) ERC4626(IERC20(_token)) ERC20("Raiz Tokenized Vault", "RTV") {
  constructor(ERC20 _asset, string memory _name, string memory _symbol) ERC4626(_asset) ERC20(_name, _symbol) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
  }
  // constructor(address _token) ERC4626(IERC20Metadata(_token)) ERC20("Raiz Tokenized Vault", "RTV") {
  //   _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  //   _grantRole(MINTER_ROLE, msg.sender);
  // }

  function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    _mint(to, amount);
  }
}
