import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import "dotenv/config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const velvetTokenAddress = process.env.VELVET_TOKEN_ADDRESS;
  const maxWeekLockPeriod = process.env.MAX_WEEK_LOCK_PERIOD;


  await deploy("veVelvet", {
    from: deployer,
    contract: "veVelvet",
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract:"DefaultProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [velvetTokenAddress, maxWeekLockPeriod] // Todo get these value from env files to be used in the future 1st is address of velvet token and 2nd is the max week lock period
        }
      }
    },
    log: true,
  });
};

export default func;
func.tags = ["veVelvet"];
