import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying with account:", deployer);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer)).toString());

  // Deploy FHECounter
  const counter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });

  console.log("FHECounter deployed to:", counter.address);
  console.log("✅ Deployment complete!");
};

func.tags = ["FHECounter"];
export default func;
