import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { UserDecryptMultipleValues, UserDecryptMultipleValues__factory } from "../../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

describe("UserDecryptMultipleValues", function () {
  let signers: Signers;
  let contract: UserDecryptMultipleValues;
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

    const factory = (await ethers.getContractFactory("UserDecryptMultipleValues")) as UserDecryptMultipleValues__factory;
    contract = (await factory.deploy()) as UserDecryptMultipleValues;
    contractAddress = await contract.getAddress();
  });

  it("should submit three encrypted secrets", async function () {
    const secret1 = 100;
    const secret2 = 200;
    const secret3 = 300;

    const enc1 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret1).encrypt();

    const enc2 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret2).encrypt();

    const enc3 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret3).encrypt();

    const tx = await contract
      .connect(signers.alice)
      .submitSecrets(enc1.handles[0], enc1.inputProof, enc2.handles[0], enc2.inputProof, enc3.handles[0], enc3.inputProof);

    await expect(tx).to.emit(contract, "SecretsUpdated");
  });

  it("should retrieve all three encrypted secrets", async function () {
    const secret1 = 111;
    const secret2 = 222;
    const secret3 = 333;

    const enc1 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret1).encrypt();

    const enc2 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret2).encrypt();

    const enc3 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret3).encrypt();

    await contract
      .connect(signers.alice)
      .submitSecrets(enc1.handles[0], enc1.inputProof, enc2.handles[0], enc2.inputProof, enc3.handles[0], enc3.inputProof);

    const [handle1, handle2, handle3] = await contract.connect(signers.alice).getMySecrets();

    const dec1 = await fhevm.userDecryptEuint(FhevmType.euint32, handle1, contractAddress, signers.alice);

    const dec2 = await fhevm.userDecryptEuint(FhevmType.euint32, handle2, contractAddress, signers.alice);

    const dec3 = await fhevm.userDecryptEuint(FhevmType.euint32, handle3, contractAddress, signers.alice);

    expect(dec1).to.equal(secret1);
    expect(dec2).to.equal(secret2);
    expect(dec3).to.equal(secret3);
  });

  it("should combine secrets (sum)", async function () {
    const secret1 = 10;
    const secret2 = 20;
    const secret3 = 30;

    const enc1 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret1).encrypt();

    const enc2 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret2).encrypt();

    const enc3 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret3).encrypt();

    await contract
      .connect(signers.alice)
      .submitSecrets(enc1.handles[0], enc1.inputProof, enc2.handles[0], enc2.inputProof, enc3.handles[0], enc3.inputProof);

    const combinedHandle = await contract.connect(signers.alice).combineSecrets();

    const combinedDecrypted = await fhevm.userDecryptEuint(FhevmType.euint32, combinedHandle, contractAddress, signers.alice);

    expect(combinedDecrypted).to.equal(secret1 + secret2 + secret3);
  });

  it("should compare secrets", async function () {
    const secret1 = 100;
    const secret2 = 100; // Same value for equality test

    const enc1 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret1).encrypt();

    const enc2 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret2).encrypt();

    const enc3 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(0).encrypt();

    await contract
      .connect(signers.alice)
      .submitSecrets(enc1.handles[0], enc1.inputProof, enc2.handles[0], enc2.inputProof, enc3.handles[0], enc3.inputProof);

    const comparisonHandle = await contract.connect(signers.alice).compareSecret1To2();

    const comparisonResult = await fhevm.userDecryptEuint(FhevmType.ebool, comparisonHandle, contractAddress, signers.alice);

    expect(comparisonResult).to.equal(1); // True - they are equal
  });

  it("should update individual secret", async function () {
    const secret1 = 100;
    const secret2 = 200;
    const secret3 = 300;

    const enc1 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret1).encrypt();

    const enc2 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret2).encrypt();

    const enc3 = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(secret3).encrypt();

    await contract
      .connect(signers.alice)
      .submitSecrets(enc1.handles[0], enc1.inputProof, enc2.handles[0], enc2.inputProof, enc3.handles[0], enc3.inputProof);

    // Update secret at index 1
    const newSecret2 = 999;

    const newEnc = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(newSecret2).encrypt();

    await contract.connect(signers.alice).updateSecret(1, newEnc.handles[0], newEnc.inputProof);

    const [, handle2] = await contract.connect(signers.alice).getMySecrets();

    const dec2 = await fhevm.userDecryptEuint(FhevmType.euint32, handle2, contractAddress, signers.alice);

    expect(dec2).to.equal(newSecret2);
  });
});
