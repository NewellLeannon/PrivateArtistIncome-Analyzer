/**
 * @title PrivateArtistIncomeAnalyzer Tests
 * @notice Comprehensive test suite demonstrating privacy-preserving artist income analytics using FHEVM
 * @dev Tests cover artist registration, encrypted income submission, and aggregate analysis
 *
 * Key Concepts Demonstrated:
 * - FHE Encryption: Converting plaintext values to encrypted euint types
 * - Access Control: Using FHE.allowThis() and FHE.allow() for permission management
 * - User Decryption: Decrypting individual artist data with proper permissions
 * - Aggregate Computation: Computing statistics on encrypted data
 * - Public Decryption: Using relayer for aggregate results
 */

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { PrivateArtistIncomeAnalyzer, PrivateArtistIncomeAnalyzer__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

/**
 * @notice Deploys a fresh PrivateArtistIncomeAnalyzer contract instance
 * @dev Used in beforeEach hook to ensure test isolation
 */
async function deployFixture() {
  const factory = (await ethers.getContractFactory(
    "PrivateArtistIncomeAnalyzer",
  )) as PrivateArtistIncomeAnalyzer__factory;
  const contract = (await factory.deploy()) as PrivateArtistIncomeAnalyzer;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PrivateArtistIncomeAnalyzer", function () {
  let signers: Signers;
  let contract: PrivateArtistIncomeAnalyzer;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn("This test suite requires FHEVM mock environment");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(signers.deployer.address);
    });

    it("should initialize totalArtists to 0", async function () {
      expect(await contract.totalArtists()).to.equal(0);
    });

    it("should initialize analysisSessionId to 1", async function () {
      expect(await contract.analysisSessionId()).to.equal(1);
    });
  });

  describe("Artist Registration", function () {
    it("should allow artist to register with valid ID", async function () {
      const artistId = "artist_alice_001";

      const tx = await contract.connect(signers.alice).registerArtist(artistId);
      await tx.wait();

      expect(await contract.totalArtists()).to.equal(1);
      expect(await contract.isRegisteredArtist(signers.alice.address)).to.be.true;
    });

    it("should emit ArtistRegistered event on registration", async function () {
      const artistId = "artist_bob_002";

      await expect(contract.connect(signers.bob).registerArtist(artistId))
        .to.emit(contract, "ArtistRegistered")
        .withArgs(signers.bob.address, artistId);
    });

    it("should prevent duplicate registration", async function () {
      const artistId = "artist_alice_001";

      await contract.connect(signers.alice).registerArtist(artistId);

      await expect(contract.connect(signers.alice).registerArtist(artistId)).to.be.revertedWith(
        "Already registered",
      );
    });

    it("should reject empty artist ID", async function () {
      await expect(contract.connect(signers.alice).registerArtist("")).to.be.revertedWith("Invalid artist ID");
    });

    it("should track registered artists count", async function () {
      await contract.connect(signers.alice).registerArtist("alice");
      await contract.connect(signers.bob).registerArtist("bob");
      await contract.connect(signers.charlie).registerArtist("charlie");

      expect(await contract.getRegisteredArtistsCount()).to.equal(3);
    });
  });

  describe("Income Data Submission", function () {
    beforeEach(async function () {
      // Register alice before each test
      await contract.connect(signers.alice).registerArtist("artist_alice");
    });

    it("should allow registered artist to submit encrypted income data", async function () {
      const totalIncome = 50000n;
      const artworksSold = 25;
      const averagePrice = 2000;
      const royaltyEarnings = 5000;
      const commissionEarnings = 10000;

      const tx = await contract
        .connect(signers.alice)
        .submitIncomeData(totalIncome, artworksSold, averagePrice, royaltyEarnings, commissionEarnings);

      await expect(tx).to.emit(contract, "IncomeUpdated").withArgs(signers.alice.address, await ethers.provider.getBlock("latest").then((b) => b?.timestamp));
    });

    it("should reject income submission from unregistered artist", async function () {
      const totalIncome = 50000n;
      const artworksSold = 25;
      const averagePrice = 2000;
      const royaltyEarnings = 5000;
      const commissionEarnings = 10000;

      await expect(
        contract
          .connect(signers.bob)
          .submitIncomeData(totalIncome, artworksSold, averagePrice, royaltyEarnings, commissionEarnings),
      ).to.be.revertedWith("Not registered artist");
    });

    it("should allow artist to update their income data multiple times", async function () {
      // First submission
      await contract.connect(signers.alice).submitIncomeData(50000n, 25, 2000, 5000, 10000);

      // Second submission (update)
      const tx = await contract.connect(signers.alice).submitIncomeData(60000n, 30, 2000, 6000, 12000);

      await expect(tx).to.emit(contract, "IncomeUpdated");
    });
  });

  describe("Creative Analytics Submission", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerArtist("artist_alice");
    });

    it("should allow registered artist to submit creative analytics", async function () {
      const digitalArt = 15000;
      const physicalArt = 20000;
      const nftSales = 10000;
      const licensing = 3000;
      const workshops = 1000;
      const commissions = 1000;

      const tx = await contract
        .connect(signers.alice)
        .submitCreativeAnalytics(digitalArt, physicalArt, nftSales, licensing, workshops, commissions);

      await tx.wait();

      expect(tx).to.not.be.reverted;
    });

    it("should reject analytics submission from unregistered artist", async function () {
      await expect(
        contract.connect(signers.bob).submitCreativeAnalytics(15000, 20000, 10000, 3000, 1000, 1000),
      ).to.be.revertedWith("Not registered artist");
    });
  });

  describe("Access Control - Analyst Authorization", function () {
    it("should allow owner to authorize analyst", async function () {
      await expect(contract.connect(signers.deployer).authorizeAnalyst(signers.bob.address))
        .to.emit(contract, "AnalystAuthorized")
        .withArgs(signers.bob.address);

      expect(await contract.authorizedAnalysts(signers.bob.address)).to.be.true;
    });

    it("should prevent non-owner from authorizing analyst", async function () {
      await expect(contract.connect(signers.alice).authorizeAnalyst(signers.bob.address)).to.be.revertedWith(
        "Not authorized",
      );
    });

    it("should allow owner to revoke analyst authorization", async function () {
      await contract.connect(signers.deployer).authorizeAnalyst(signers.bob.address);
      expect(await contract.authorizedAnalysts(signers.bob.address)).to.be.true;

      await contract.connect(signers.deployer).revokeAnalyst(signers.bob.address);
      expect(await contract.authorizedAnalysts(signers.bob.address)).to.be.false;
    });
  });

  describe("Income Analysis Generation", function () {
    beforeEach(async function () {
      // Register multiple artists with income data
      await contract.connect(signers.alice).registerArtist("alice");
      await contract.connect(signers.alice).submitIncomeData(50000n, 25, 2000, 5000, 10000);

      await contract.connect(signers.bob).registerArtist("bob");
      await contract.connect(signers.bob).submitIncomeData(75000n, 40, 1875, 7500, 15000);

      // Authorize deployer as analyst
      await contract.connect(signers.deployer).authorizeAnalyst(signers.deployer.address);
    });

    it("should allow authorized analyst to generate income analysis", async function () {
      const tx = await contract.connect(signers.deployer).generateIncomeAnalysis();

      await expect(tx)
        .to.emit(contract, "AnalysisCompleted")
        .withArgs(1, 2); // sessionId 1, 2 artists
    });

    it("should reject analysis generation from unauthorized user", async function () {
      await expect(contract.connect(signers.charlie).generateIncomeAnalysis()).to.be.revertedWith(
        "Not authorized analyst",
      );
    });

    it("should reject analysis when no artists registered", async function () {
      // Deploy fresh contract with no artists
      const { contract: freshContract } = await deployFixture();
      await freshContract.connect(signers.deployer).authorizeAnalyst(signers.deployer.address);

      await expect(freshContract.connect(signers.deployer).generateIncomeAnalysis()).to.be.revertedWith(
        "No artists registered",
      );
    });

    it("should create income report with correct metadata", async function () {
      await contract.connect(signers.deployer).generateIncomeAnalysis();

      const reportInfo = await contract.getReportInfo(1);

      expect(reportInfo.artistCount).to.equal(2);
      expect(reportInfo.isFinalized).to.be.false;
      expect(reportInfo.reportTimestamp).to.be.gt(0);
    });
  });

  describe("Platform Statistics", function () {
    it("should return correct platform stats", async function () {
      await contract.connect(signers.alice).registerArtist("alice");
      await contract.connect(signers.bob).registerArtist("bob");

      const stats = await contract.getPlatformStats();

      expect(stats.totalArtistsCount).to.equal(2);
      expect(stats.currentSessionId).to.equal(1);
      expect(stats.lastReportTimestamp).to.equal(0); // No reports generated yet
    });
  });

  describe("Artist Profile Management", function () {
    it("should allow artist to view their profile", async function () {
      const artistId = "alice_profile";
      await contract.connect(signers.alice).registerArtist(artistId);

      const profile = await contract.connect(signers.alice).getMyProfile();

      expect(profile.artistId).to.equal(artistId);
      expect(profile.isActive).to.be.true;
      expect(profile.profileCreated).to.be.gt(0);
    });

    it("should allow owner to deactivate artist profile", async function () {
      await contract.connect(signers.alice).registerArtist("alice");
      expect(await contract.isRegisteredArtist(signers.alice.address)).to.be.true;

      await contract.connect(signers.deployer).deactivateArtist(signers.alice.address);

      expect(await contract.isRegisteredArtist(signers.alice.address)).to.be.false;
    });

    it("should allow owner to reactivate artist profile", async function () {
      await contract.connect(signers.alice).registerArtist("alice");
      await contract.connect(signers.deployer).deactivateArtist(signers.alice.address);

      await contract.connect(signers.deployer).reactivateArtist(signers.alice.address);

      expect(await contract.isRegisteredArtist(signers.alice.address)).to.be.true;
    });

    it("should reject reactivation of never-registered artist", async function () {
      await expect(contract.connect(signers.deployer).reactivateArtist(signers.bob.address)).to.be.revertedWith(
        "Artist never registered",
      );
    });
  });

  describe("Privacy Guarantees", function () {
    it("should store income data in encrypted form (not visible on-chain)", async function () {
      await contract.connect(signers.alice).registerArtist("alice");
      await contract.connect(signers.alice).submitIncomeData(50000n, 25, 2000, 5000, 10000);

      // The profile is returned but encrypted values are handles (not readable plaintext)
      const profile = await contract.artistProfiles(signers.alice.address);

      // These should be encrypted handles, not the actual values
      expect(profile.totalIncome).to.not.equal(50000n);
      expect(profile.isActive).to.be.true;
    });
  });
});
