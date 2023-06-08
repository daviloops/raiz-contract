import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";
import 'solidity-coverage' // Testing all code is run

dotenv.config();

// This is the mnemonic used by celo-devchain
const DEVCHAIN_MNEMONIC =
    "concert load couple harbor equip island argue ramp clarify fence smart topic";

const mnemonicPath = "m/44'/52752'/0'/0"; // derivation path used by Celo

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: { tests: "tests" },
  namedAccounts: {
    deployer: 0,
  },
  // defaultNetwork: "alfajores",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: DEVCHAIN_MNEMONIC,
      },
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220
    },     
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY || '',
      celo: process.env.CELOSCAN_API_KEY || '',
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
