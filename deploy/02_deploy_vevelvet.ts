import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import "dotenv/config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const live = ["bsc", "base"].includes(hre.network.name);

  // A mainnet token address has no code locally, so tests use the MockERC20.
  const mock = (await deployments.getOrNull("MockERC20"))?.address;
  const velvetTokenAddress = live
    ? process.env.VELVET_TOKEN_ADDRESS || mock
    : mock || process.env.VELVET_TOKEN_ADDRESS;
  if (!velvetTokenAddress) {
    throw new Error(
      "No base token: set VELVET_TOKEN_ADDRESS or deploy MockERC20 first"
    );
  }
  const maxWeekLockPeriod = live
    ? parseInt(process.env.MAX_WEEK_LOCK_PERIOD || "200")
    : 30;

  // DEPLOY_NAME deploys an isolated copy with its own proxy and ProxyAdmin.
  const name = process.env.DEPLOY_NAME || "veVelvet";
  const adminName =
    name === "veVelvet" ? "DefaultProxyAdmin" : `${name}_ProxyAdmin`;

  // On a live network the "veVelvet" name reuses the recorded proxy and upgrades
  // it in place, so require an explicit opt-in.
  if (live && name === "veVelvet" && process.env.ALLOW_MAINNET_UPGRADE !== "1") {
    throw new Error(
      `Refusing to touch the live "veVelvet" proxy on ${hre.network.name}. ` +
        `Set DEPLOY_NAME=<something-else> for a test copy, or ALLOW_MAINNET_UPGRADE=1 if you really mean it.`
    );
  }

  await deploy(name, {
    from: deployer,
    contract: "veVelvet",
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract:
        name === "veVelvet"
          ? "DefaultProxyAdmin"
          : {
              name: adminName,
              artifact: require("hardhat-deploy/extendedArtifacts/ProxyAdmin.json"),
            },
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

console.log("DEPLOYMENT ENDED");

export default func;
func.tags = ["veVelvet"];
