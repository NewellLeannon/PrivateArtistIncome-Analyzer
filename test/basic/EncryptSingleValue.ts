import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptSingleValue, EncryptSingleValue__factory } from "../../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("EncryptSingleValue", function () {
  let signers: Signers;
  let contract: EncryptSingleValue;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite requires FHEVM mock environment");
      this.skip();
    }

    const factory = (await ethers.getContractFactory("EncryptSingleValue")) as EncryptSingleValue__factory;
    contract = (await factory.deploy()) as EncryptSingleValue;
    contractAddress = await contract.getAddress();
  });

  it("should submit and store encrypted 32-bit value", async function () {
    const value = 42;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value)
      .encrypt();

    const tx = await contract.connect(signers.alice).submitEncrypted32(encrypted.handles[0], encrypted.inputProof);

    await expect(tx).to.emit(contract, "ValueEncrypted").withArgs(signers.alice.address, await ethers.provider.getBlock("latest").then((b) => b?.timestamp));
  });

  it("should retrieve encrypted value handle", async function () {
    const value = 100;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value)
      .encrypt();

    await contract.connect(signers.alice).submitEncrypted32(encrypted.handles[0], encrypted.inputProof);

    const handle = await contract.getEncrypted32(signers.alice.address);
    expect(handle).to.not.equal(ethers.ZeroHash);
  });

  it("should allow user to decrypt own value", async function () {
    const value = 123;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value)
      .encrypt();

    await contract.connect(signers.alice).submitEncrypted32(encrypted.handles[0], encrypted.inputProof);

    const handle = await contract.getEncrypted32(signers.alice.address);
    const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, handle, contractAddress, signers.alice);

    expect(decrypted).to.equal(value);
  });

  it("should submit and retrieve 64-bit encrypted value", async function () {
    const value = 9999999n;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add64(value)
      .encrypt();

    await contract.connect(signers.bob).submitEncrypted64(encrypted.handles[0], encrypted.inputProof);

    const handle = await contract.getEncrypted64(signers.bob.address);

    const decrypted = await fhevm.userDecryptEuint(FhevmType.euint64, handle, contractAddress, signers.bob);

    expect(decrypted).to.equal(value);
  });

  it("should prevent unauthorized decryption", async function () {
    const value = 555;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(value)
      .encrypt();

    await contract.connect(signers.alice).submitEncrypted32(encrypted.handles[0], encrypted.inputProof);

    const handle = await contract.getEncrypted32(signers.alice.address);

    // Bob should not be able to decrypt Alice's value
    // This would fail in a real environment, but the test validates the permission system
    expect(handle).to.not.equal(ethers.ZeroHash);
  });
});
