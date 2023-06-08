import { ethers } from "hardhat";
import "dotenv/config";
import * as tokenizedVaultJson from "../artifacts/contracts/TokenizedVault.sol/TokenizedVault.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const alfajorescUsdTokenAddress = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1';


function setupProvider() {
  const infuraOptions = process.env.INFURA_API_KEY
    ? process.env.INFURA_API_SECRET
      ? {
          projectId: process.env.INFURA_API_KEY,
          projectSecret: process.env.INFURA_API_SECRET,
        }
      : process.env.INFURA_API_KEY
    : "";
  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: infuraOptions,
  };
  const provider = ethers.providers.getDefaultProvider("alfajores", options);
  return provider;
}

async function main() {
  const wallet =
  process.env.MNEMONIC && process.env.MNEMONIC.length > 0
    ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
    : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  console.log("Deploying Tokenized Vault contract");
  const tokenizedVaultFactory = new ethers.ContractFactory(
    tokenizedVaultJson.abi,
    tokenizedVaultJson.bytecode,
    signer
  );
  const tokenizedVaultContract = await tokenizedVaultFactory.deploy(alfajorescUsdTokenAddress);
  console.log("Awaiting confirmations");
  await tokenizedVaultContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${tokenizedVaultContract.address}`);
  console.log("Contract data: ", tokenizedVaultContract);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
