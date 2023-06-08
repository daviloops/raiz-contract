import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Staking, TestToken } from "../typechain-types";
import { BigNumber } from "ethers";

describe("Staking contract", async () => {
  let accounts: SignerWithAddress[];
  let stakingContract: Staking;
  let tokenContract: TestToken;

  before(async () => {
    accounts = await ethers.getSigners();
    
    const tokenContractFactory = await ethers.getContractFactory("TestToken");
    tokenContract = await tokenContractFactory.deploy();
    await tokenContract.deployed();
    
    const stakingContractFactory = await ethers.getContractFactory("Staking");
    stakingContract = await stakingContractFactory.deploy(tokenContract.address);
    await stakingContract.deployed();

    console.log("Deployed contract");
  });

  describe("When the contract is deployed", async () => {
    it("has the correct owner assigned", async () => {
      expect(await stakingContract.owner()).to.equal(accounts[0].address);
    });

    it("has no balances yet", async () => {
      expect(await stakingContract.balanceOf(accounts[0].address)).to.equal(0);
      expect(await stakingContract.balanceOf(accounts[1].address)).to.equal(0);
    });
  });

  describe("When a user stakes an amount", async () => {
    const STAKE_TEST_AMOUNT: number = 100;
    before(async () => {
      const tx = await stakingContract.connect(accounts[1]).stake(STAKE_TEST_AMOUNT);
      await tx.wait();

      console.log('balance-----------------', await stakingContract.balanceOf(accounts[1].address))
    });

    it("increases the stake balance of user by the amount", async () => {
      expect(await stakingContract.balanceOf(accounts[1].address)).to.equal(STAKE_TEST_AMOUNT);
    });
  });
});