import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "dotenv/config";
const config: HardhatUserConfig = {
  solidity: "0.8.30",
  namedAccounts: {
    deployer: {
      default: 0,
      base: `${process.env.DEPLOYER}`
    },
    user1: {
      default: 1
    },
    user2: {
      default: 2
    }
  }, 
  networks: {
    base: {
      url: process.env.BSC_RPC || "",
      chainId: 8453,
      saveDeployments: true,
      accounts: {
        mnemonic:
          `${process.env.MEMONIC}`,
      },
      verify: {
        etherscan: {
          apiUrl: 'https://api.basescan.org',
          apiKey: process.env.ETHERSCAN_KEY
        }
      },
    }
  },
  etherscan: {
    apiKey: {
      base: `${process.env.ETHERSCAN_KEY}`,
    },
  },
  sourcify: {
    enabled: true
  },
};

export default config;
