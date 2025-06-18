import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const mockToken = await deployments.get("MockERC20");

  await deploy("veVirtual", {
    from: deployer,
    contract: "veVirtual",
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "DefaultProxyAdmin",
      execute: {
        init: {
          methodName: "initialize",
          args: [mockToken.address, 30]
        }
      }
    },
    log: true,
  });
};

export default func;
func.tags = ["veVirtual"];
func.dependencies = ["MockERC20"]; 