# Tokenized Vault Hardhat Project

This project implements the extension ERC4626 of ERC20 token contract for creating a tokenized vault where user deposits assets and the vault mints tokens in return, which user can use to claim assets back. It comes with a tokenized vault contract, a test for that contract, and a script that deploys that contract on Celo alfajores testnet. Deploy is done using hardhat-deploy package.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test ./tests/TokenizedVault.ts
npx hardhat --network alfajores deploy // Deploy to celo testnet
```
