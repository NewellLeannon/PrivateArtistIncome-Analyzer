import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * @dev Deploy PrivateArtistIncomeAnalyzer contract
 */
task("deploy:analyzer", "Deploy PrivateArtistIncomeAnalyzer", async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];

  console.log("Deploying PrivateArtistIncomeAnalyzer with account:", deployer.address);

  const factory = await hre.ethers.getContractFactory("PrivateArtistIncomeAnalyzer", deployer);
  const contract = await factory.deploy();

  const address = await contract.getAddress();
  console.log("PrivateArtistIncomeAnalyzer deployed to:", address);

  // Save deployment info
  console.log("\n✅ Deployment successful!");
  console.log("Contract Address:", address);
  console.log("Deployer Address:", deployer.address);
});

/**
 * @dev Display contract information
 */
task("info:analyzer", "Get PrivateArtistIncomeAnalyzer info")
  .addParam("address", "Contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const contractAddress = taskArgs.address;

    const contract = await hre.ethers.getContractAt("PrivateArtistIncomeAnalyzer", contractAddress);

    const owner = await contract.owner();
    const totalArtists = await contract.totalArtists();
    const analysisSessionId = await contract.analysisSessionId();

    console.log("PrivateArtistIncomeAnalyzer Information:");
    console.log("=========================================");
    console.log("Contract Address:", contractAddress);
    console.log("Owner:", owner);
    console.log("Total Artists:", totalArtists.toString());
    console.log("Analysis Session ID:", analysisSessionId.toString());
  });

/**
 * @dev Register test artist
 */
task("register:artist", "Register as an artist")
  .addParam("contract", "Contract address")
  .addParam("id", "Artist ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];

    const contract = await hre.ethers.getContractAt("PrivateArtistIncomeAnalyzer", taskArgs.contract, signer);

    console.log("Registering artist with ID:", taskArgs.id);
    console.log("Signer address:", signer.address);

    const tx = await contract.registerArtist(taskArgs.id);
    await tx.wait();

    const stats = await contract.getPlatformStats();
    console.log("✅ Artist registered!");
    console.log("Total artists:", stats.totalArtistsCount.toString());
  });

/**
 * @dev Get platform statistics
 */
task("stats:platform", "Get platform statistics")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const contract = await hre.ethers.getContractAt("PrivateArtistIncomeAnalyzer", taskArgs.contract);

    const stats = await contract.getPlatformStats();

    console.log("Platform Statistics:");
    console.log("====================");
    console.log("Total Artists:", stats.totalArtistsCount.toString());
    console.log("Current Session ID:", stats.currentSessionId.toString());
    console.log("Last Report Timestamp:", stats.lastReportTimestamp.toString());
  });
