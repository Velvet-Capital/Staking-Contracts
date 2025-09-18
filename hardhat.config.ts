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
      base: `${process.env.DEPLOYER}`,
      bsc: `${process.env.DEPLOYER}`
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
      url: process.env.BASE_RPC || "https://mainnet.base.org",
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
    },
    bsc: {
      url: process.env.BSC_RPC || "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: {
        mnemonic: `${process.env.MEMONIC}`,
      },
      gas: 30_000_000,
      verify: {
        etherscan: {
          apiUrl: "https://api.bscscan.com",
          apiKey: process.env.BSCSCAN_KEY || ""
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      base: `${process.env.ETHERSCAN_KEY}`,
      bsc: `${process.env.BSCSCAN_KEY}`,
    },
  },
  sourcify: {
    enabled: true
  },
};

export default config;
