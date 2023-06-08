import { expect } from "chai";
import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { StakingSlots, TestToken } from "../typechain-types";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("Staking contract", async () => {
    let accounts: SignerWithAddress[];
    let stakingSlotsContract: StakingSlots;
    let tokenContract: TestToken;

    before(async () => {
        accounts = await ethers.getSigners();
        
        const tokenContractFactory = await ethers.getContractFactory("TestToken");
        tokenContract = await tokenContractFactory.deploy();
        await tokenContract.deployed();
        
        const stakingSlotsContractFactory = await ethers.getContractFactory("StakingSlots");
        stakingSlotsContract = await stakingSlotsContractFactory.deploy(tokenContract.address);
        await stakingSlotsContract.deployed();
    
        console.log("Deployed contract");
    });

    describe("When the contract is deployed", async () => {
        it("has the correct owner assigned", async () => {
          expect(await stakingSlotsContract.owner()).to.equal(accounts[0].address);
        });
    
        // it("has no balances yet", async () => {
        //   expect(await stakingSlotsContract.balanceOf(accounts[0].address)).to.equal(0);
        //   expect(await stakingSlotsContract.balanceOf(accounts[1].address)).to.equal(0);
        // });
    });

    
    describe("When a user stakes an amount", async () => {
        const STAKE_TEST_AMOUNT = ethers.utils.parseEther("10");;
        const TEST_APY_AMOUNT: number = 1500;
        const TEST_DURATION: number = 31104000; // 60seg * 60min * 24hrs * 30days * 12months  = 1 year
        const IS_PAID_DEFAULT_VALUE: boolean = false;
        const IS_MATURE_DEFAULT_VALUE: boolean = false;

        before(async () => {
            const txInitWallet = await tokenContract.mint(accounts[1].address, STAKE_TEST_AMOUNT);
            
            const txAllowance = await tokenContract.connect(accounts[1]).approve(stakingSlotsContract.address, STAKE_TEST_AMOUNT);
            const tx = await stakingSlotsContract.connect(accounts[1]).stake(STAKE_TEST_AMOUNT, TEST_APY_AMOUNT, TEST_DURATION);
            await tx.wait();
        });

        it("increases the token balance of the staking contract by the amount", async () => {
            const amount = await tokenContract.balanceOf(stakingSlotsContract.address);
            expect(amount).to.equal(STAKE_TEST_AMOUNT);
        });

        it("decreases the token balance of the user contract by the amount", async () => {
            const amount = await tokenContract.balanceOf(accounts[1].address);
            expect(amount).to.equal(0);
        });

        it("stakes with related data", async () => {
            const [staker, amount, apy, duration, isMature, isPaid, timestamp] = await stakingSlotsContract.getStaking(0);
            expect(amount).to.equal(STAKE_TEST_AMOUNT);
            expect(staker).to.equal(accounts[1].address);
            expect(apy).to.equal(TEST_APY_AMOUNT);
            expect(duration).to.equal(TEST_DURATION);
            expect(isMature).to.equal(IS_MATURE_DEFAULT_VALUE);
            expect(isPaid).to.equal(IS_PAID_DEFAULT_VALUE);
            // expect(timestamp).to.equal(); // Todo: how to check timestamp?
        });

        // it("emitted the stake event", async () => {
        //     throw Error("Not yet implemented")
        // });
    });

    // describe("When a harvest is done", async () => {
    //     it("", async () => {

    //     })
    // });


    describe("When a user unstakes an amount", async () => {

        before(async () => {
            const tx = await stakingSlotsContract.connect(accounts[1]).unstake(0);
        });

        it("returns the staked amount + rewards for to the user", async () => {
            const amount = await tokenContract.balanceOf(accounts[1].address);
            // Todo: calculate staked amount + rewards
            // expect(amount).to.equal();
            throw Error("Not implemented yet");
        });
        
        it("fails if requester is not the user who staked the staking", async () => {
            const tx = await stakingSlotsContract.connect(accounts[2]).unstake(0);
            throw Error("Not implemented yet");
        });
    });
});