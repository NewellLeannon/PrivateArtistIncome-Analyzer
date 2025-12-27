import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying with account:", deployer);

  // Deploy PrivateArtistIncomeAnalyzer
  const artistAnalyzer = await deploy("PrivateArtistIncomeAnalyzer", {
    from: deployer,
    log: true,
  });

  console.log("PrivateArtistIncomeAnalyzer deployed to:", artistAnalyzer.address);

  // Deploy example contracts
  const examples = [
    { name: "FHEAdd", file: "basic/FHEAdd.sol" },
    { name: "EncryptSingleValue", file: "basic/EncryptSingleValue.sol" },
    { name: "EqualityComparison", file: "basic/EqualityComparison.sol" },
  ];

  for (const example of examples) {
    try {
      const deployed = await deploy(example.name, {
        from: deployer,
        log: true,
      });
      console.log(`${example.name} deployed to:`, deployed.address);
    } catch (error) {
      console.warn(`Note: ${example.name} deployment skipped (may not exist in this environment)`);
    }
  }

  console.log("\n✅ Deployment complete!");
  console.log("\nDeployed Contracts:");
  console.log("- PrivateArtistIncomeAnalyzer:", artistAnalyzer.address);
};

func.tags = ["main"];
export default func;
