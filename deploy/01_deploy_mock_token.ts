import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("MockERC20", {
    from: deployer,
    contract: "MockERC20",
    args: ["Mock Token", "MTK"],
    log: true,
  });
};

export default func;
func.tags = ["MockERC20"]; 