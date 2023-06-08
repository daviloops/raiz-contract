import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, BytesLike } from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TokenizedVault, TestToken } from "../typechain-types";

// Import required contracts
// require("@openzeppelin/contracts/build/contracts/ERC721.json");
require("@openzeppelin/contracts/build/contracts/ERC20.json");
// require("@openzeppelin/contracts/build/contracts/ERC4626.json");

const erc20Abi = require('human-standard-token-abi'); // Todo: use

const PREMINT_VALUE = ethers.utils.parseEther("0");
const TEST_MINT_VALUE = ethers.utils.parseEther("10");
const DEPOSIT_TEST_ASSET_AMOUNT: BigNumber = ethers.utils.parseEther("1000");

describe("TokenizedVault", function () {
  let accounts: SignerWithAddress[];
  let tokenizedVaultContract: TokenizedVault;
  let testTokenContract: TestToken;
  let minterRoleHash: BytesLike;
  
  const alfajorescUsdTokenAddress = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1';
  
  // Todo: delete if passing asset to contract worked
  //   const genericErc20Abi = require(..../.../Erc20.json);
  // const tokenContractAddress = '0x...';
  // const provider = ...; (use ethers.providers.InfuraProvider for a Node app or ethers.providers.Web3Provider(window.ethereum/window.web3) for a React app)
  
  // Deploy contract
  before(async () => {
    accounts = await ethers.getSigners();

    const ERC20abi = [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "type": "function"
      },
      // {
      //   "constant": true,
      //   "inputs": [],
      //   "name": "decimals",
      //   "outputs": [
      //     {
      //       "name": "",
      //       "type": "uint8"
      //     }
      //   ],
      //   "payable": false,
      //   "type": "function"
      // },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false, // va?
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "type": "function"
      }
    ]
    const provider = ethers.getDefaultProvider();
    // Todo: delete if passing asset to contract worked
    const cUsdContract = new ethers.Contract(alfajorescUsdTokenAddress, ERC20abi, provider);
    
    const testTokenContractFactory = await ethers.getContractFactory("TestToken");
    testTokenContract = await testTokenContractFactory.deploy();
    await testTokenContract.deployed();
    
    const tokenizedVaultContractFactory = await ethers.getContractFactory("TokenizedVault");
    tokenizedVaultContract = await tokenizedVaultContractFactory.deploy(testTokenContract.address, "Raiz Vault Token", "RVT");
    await tokenizedVaultContract.deployed();
  
    console.log('Contract deployed....');
    console.log('Contract address: ', tokenizedVaultContract.address);
    console.log('Contract sender address: ', accounts[0].address);
    console.log('Token name: ', await tokenizedVaultContract.name());
    console.log('Token symbol: ', await tokenizedVaultContract.symbol());
    console.log('Asset address: ', await tokenizedVaultContract.asset());
    console.log('Total supply of tokens: ', await tokenizedVaultContract.totalSupply());
    console.log('Token balance of contract: ', await tokenizedVaultContract.balanceOf(accounts[0].address));
    minterRoleHash = await tokenizedVaultContract.MINTER_ROLE()
    console.log('Minter role hash: ', minterRoleHash);
  }); 

  describe("When the contract is deployed", async () => {    
    it("has zero total supply of tokens", async () => {
      const totalSupplyBN = await tokenizedVaultContract.totalSupply();
      const expectedValueBN = PREMINT_VALUE;
      const diffBN = totalSupplyBN.gt(expectedValueBN)
        ? totalSupplyBN.sub(expectedValueBN)
        : expectedValueBN.sub(totalSupplyBN);
      const diff = Number(diffBN);
      expect(diff).to.eq(0);
    });

    it("has zero total supply of assets", async () => {
      const totalAssetsBN = await tokenizedVaultContract.totalAssets();
      const expectedValueBN = PREMINT_VALUE;
      const diffBN = totalAssetsBN.gt(expectedValueBN)
        ? totalAssetsBN.sub(expectedValueBN)
        : expectedValueBN.sub(totalAssetsBN);
      const diff = Number(diffBN);
      expect(diff).to.eq(0);
    });

    it("sets the deployer as minter", async () => {
      const hasRole = await tokenizedVaultContract.hasRole(
        minterRoleHash,
        accounts[0].address
      );
      expect(hasRole).to.eq(true);
    });
  });

    it("uses a valid ERC20 as asset token", async () => {
      const ERC20abi = [
        {
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "name": "",
              "type": "string"
            }
          ],
          "payable": false,
          "type": "function"
        },
        // {
        //   "constant": true,
        //   "inputs": [],
        //   "name": "decimals",
        //   "outputs": [
        //     {
        //       "name": "",
        //       "type": "uint8"
        //     }
        //   ],
        //   "payable": false,
        //   "type": "function"
        // },
        {
          "constant": true,
          "inputs": [
            {
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "name": "balance",
              "type": "uint256"
            }
          ],
          "payable": false, // va?
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "name": "",
              "type": "string"
            }
          ],
          "payable": false,
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "type": "function"
        }
      ]
      const assetContractAddress = await tokenizedVaultContract.asset();

      var tokenContract = new ethers.Contract(assetContractAddress, ERC20abi, accounts[1])
      const [assetTokenName, assetTokenSymbol, assetTokenSupply] =
      await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
      ]);
      expect(assetTokenName.length).to.greaterThan(0);
      expect(assetTokenSymbol.length).to.greaterThan(0);
      expect(assetTokenSupply.toNumber()).to.eq(0);

      // IERC20(await tokenizedVaultContract.asset()).supportsInterface(0x80ac58cd)
    });

  describe("When user user deposits an asset", async () => {
    let userAssetAmountBefore: BigNumber;
    let shareAmount: BigNumber;
    let vaultTokenAmountBefore: BigNumber;
    let vaultTokenAmountAfter: BigNumber;
  

    beforeEach(async () => {
      // increase assets of user1
      const txMint = await testTokenContract.mint(accounts[1].address, DEPOSIT_TEST_ASSET_AMOUNT);
      await txMint.wait();

      userAssetAmountBefore = await testTokenContract.balanceOf(accounts[1].address);
      vaultTokenAmountBefore = await tokenizedVaultContract.balanceOf(accounts[1].address);
      shareAmount = await tokenizedVaultContract.previewDeposit(DEPOSIT_TEST_ASSET_AMOUNT);


      // user1 connects to tokenizedVault contract and deposits
      await testTokenContract.connect(accounts[1]).approve(tokenizedVaultContract.address, DEPOSIT_TEST_ASSET_AMOUNT);
      const tx = await tokenizedVaultContract.connect(accounts[1]).deposit(DEPOSIT_TEST_ASSET_AMOUNT, accounts[1].address);
      await tx.wait();
    });
    
    it("increases the amount of assets in the tokenized vault", async () => {
      const currentAssetTotal = await tokenizedVaultContract.totalAssets();

      const diffBN = currentAssetTotal.sub(DEPOSIT_TEST_ASSET_AMOUNT);
      const diff = Number(diffBN);
      expect(diff).to.eq(0);
    });
    
    it("reduces the amount of assets in user account", async () => {
      const userAssetAmountAfter = await testTokenContract.balanceOf(accounts[1].address);

      const diffBN = userAssetAmountBefore.sub(userAssetAmountAfter);
      // const diff = Number(diffBN);
      expect(diffBN).to.eq(DEPOSIT_TEST_ASSET_AMOUNT);
    });
    
    it("mints correct amount of shares for the user", async () => {
      const vaultTokenAmountAfter = await tokenizedVaultContract.balanceOf(accounts[1].address);
      
      const diffBN = vaultTokenAmountAfter.sub(vaultTokenAmountBefore);
      // const diff = Number(diffBN);
      expect(diffBN).to.equal(shareAmount);
    });
    
    // Event is emitted
    it("a deposit event is emitted", async () => {
      const txMint = await testTokenContract.mint(accounts[1].address, DEPOSIT_TEST_ASSET_AMOUNT);
      await txMint.wait();
      
      const shareAmountFromDeposit = await tokenizedVaultContract.previewDeposit(DEPOSIT_TEST_ASSET_AMOUNT);
      
      await testTokenContract.connect(accounts[1]).approve(tokenizedVaultContract.address, DEPOSIT_TEST_ASSET_AMOUNT);
      expect(await tokenizedVaultContract.connect(accounts[1]).deposit(DEPOSIT_TEST_ASSET_AMOUNT, accounts[1].address))
      .to.emit(tokenizedVaultContract, "Deposit")
      .withArgs(accounts[1].address, accounts[1].address, DEPOSIT_TEST_ASSET_AMOUNT, shareAmountFromDeposit);
    });
  });

  describe("When user redeems an amount of assets", async () => {
    let userAssetAmountBefore: BigNumber; // Todo: When to use bignumber?
    let userVaultTokenAmountBefore: BigNumber; // Todo: When to use bignumber?

    let REDEEM_TEST_SHARES_AMOUNT: BigNumber;
    let previewAssets: BigNumber;
    
    beforeEach(async () => {
      userAssetAmountBefore = await testTokenContract.balanceOf(accounts[1].address);
      userVaultTokenAmountBefore = await tokenizedVaultContract.balanceOf(accounts[1].address);

      REDEEM_TEST_SHARES_AMOUNT = userVaultTokenAmountBefore.div(2);

      previewAssets = await tokenizedVaultContract.previewRedeem(REDEEM_TEST_SHARES_AMOUNT);

      const txRedeem = await tokenizedVaultContract.connect(accounts[1]).redeem(REDEEM_TEST_SHARES_AMOUNT , accounts[1].address, accounts[1].address);
    });

    it("returns corresponding assets to user", async () => {
      const userAssetAmountAfter = await testTokenContract.balanceOf(accounts[1].address);
      const diffBN = userAssetAmountAfter.sub(userAssetAmountBefore);
      // const diff = Number(diffBN); // Todo: convert BitNumber to Number
      expect(diffBN).to.equal(previewAssets);
    });
    
    it("reduces the amount of vault tokens the user redeemed", async () => {
      const userVaultTokenAmountAfter = await tokenizedVaultContract.balanceOf(accounts[1].address);

      const diffBN = userVaultTokenAmountBefore.sub(userVaultTokenAmountAfter);
      // const diff = Number(diffBN); // Todo: convert BitNumber to Number
      expect(diffBN).to.equal(REDEEM_TEST_SHARES_AMOUNT);
    });
  });

  describe("When the user withdraws assets for all his shares", async () => {
    let userVaultBalanceBefore: BigNumber;
    let userAssetBalanceBefore: BigNumber;
    let userTotalAssetOnVault: BigNumber;

    before(async () => {
      userAssetBalanceBefore = await testTokenContract.balanceOf(accounts[1].address);
      userVaultBalanceBefore = await tokenizedVaultContract.balanceOf(accounts[1].address);
      userTotalAssetOnVault = await tokenizedVaultContract.convertToAssets(userVaultBalanceBefore);

      await tokenizedVaultContract.connect(accounts[1]).withdraw(userTotalAssetOnVault, accounts[1].address, accounts[1].address);
    });

    it("increases his amount of assets", async () => {
      const userAssetBalanceAfter = await testTokenContract.balanceOf(accounts[1].address);
      const diffBN = userAssetBalanceAfter.sub(userAssetBalanceBefore);
      // const diff = Number(diffBN);
      expect(diffBN).to.equal(userTotalAssetOnVault);
    });

    it("reduces his amount of vault tokens", async () => {
      const userVaultBalanceAfter = await tokenizedVaultContract.balanceOf(accounts[1].address);
      const diffBN = userVaultBalanceBefore.sub(userVaultBalanceAfter);
      // const diff = Number(diffBN);
      expect(diffBN).to.equal(userVaultBalanceBefore);
    });

    it("empties user vault tokens", async () => {
      const userVaultBalanceAfter = await tokenizedVaultContract.balanceOf(accounts[1].address);
      expect(userVaultBalanceAfter).to.equal(0);
    });
  }); 

});
