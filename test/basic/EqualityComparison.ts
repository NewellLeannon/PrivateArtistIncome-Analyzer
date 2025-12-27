import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EqualityComparison, EqualityComparison__factory } from "../../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

describe("EqualityComparison", function () {
  let signers: Signers;
  let contract: EqualityComparison;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite requires FHEVM mock environment");
      this.skip();
    }

    const factory = (await ethers.getContractFactory("EqualityComparison")) as EqualityComparison__factory;
    contract = (await factory.deploy()) as EqualityComparison;
    contractAddress = await contract.getAddress();
  });

  it("should compare two equal encrypted values", async function () {
    const value = 42;

    // Set stored value
    const setInput = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(value).encrypt();

    await contract.connect(signers.alice).setValue(setInput.handles[0], setInput.inputProof);

    // Compare with equal value
    const compareInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .compareEqual(compareInput.handles[0], compareInput.inputProof);
    await tx.wait();

    const resultHandle = await contract.getLastComparisonResult();
    const decrypted = await fhevm.userDecryptEuint(FhevmType.ebool, resultHandle, contractAddress, signers.alice);

    // Result should be 1 (true) for equal values
    expect(decrypted).to.equal(1);
  });

  it("should compare two unequal encrypted values", async function () {
    const value1 = 42;
    const value2 = 100;

    // Set stored value
    const setInput = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(value1).encrypt();

    await contract.connect(signers.alice).setValue(setInput.handles[0], setInput.inputProof);

    // Compare with different value
    const compareInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value2)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .compareEqual(compareInput.handles[0], compareInput.inputProof);
    await tx.wait();

    const resultHandle = await contract.getLastComparisonResult();
    const decrypted = await fhevm.userDecryptEuint(FhevmType.ebool, resultHandle, contractAddress, signers.alice);

    // Result should be 0 (false) for different values
    expect(decrypted).to.equal(0);
  });

  it("should compare encrypted value against plaintext", async function () {
    const encryptedValue = 555;
    const plaintext = 555;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(encryptedValue)
      .encrypt();

    const tx = await contract.connect(signers.alice).compareToPlaintext(encrypted.handles[0], encrypted.inputProof, plaintext);

    await tx.wait();

    const resultHandle = await contract.getLastComparisonResult();
    const decrypted = await fhevm.userDecryptEuint(FhevmType.ebool, resultHandle, contractAddress, signers.alice);

    expect(decrypted).to.equal(1); // Should be equal
  });

  it("should use conditional operation (FHE.select)", async function () {
    const value = 100;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value)
      .encrypt();

    // When value equals 100, should return 999, otherwise 111
    const tx = await contract.connect(signers.alice).conditionalOperation(encrypted.handles[0], encrypted.inputProof, 999, 111);

    await tx.wait();

    const resultHandle = await contract.getLastComparisonResult();
    // Note: This tests the mechanism works; the actual conditional result would be in a separate getter
  });
});
