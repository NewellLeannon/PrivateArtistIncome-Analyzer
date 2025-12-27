import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHEAdd, FHEAdd__factory } from "../../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

describe("FHEAdd", function () {
  let signers: Signers;
  let contract: FHEAdd;
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

    const factory = (await ethers.getContractFactory("FHEAdd")) as FHEAdd__factory;
    contract = (await factory.deploy()) as FHEAdd;
    contractAddress = await contract.getAddress();
  });

  it("should add two encrypted values", async function () {
    const a = 10;
    const b = 20;

    const encryptedA = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(a).encrypt();

    const encryptedB = await fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(b).encrypt();

    const tx = await contract
      .connect(signers.alice)
      .addEncrypted(encryptedA.handles[0], encryptedA.inputProof, encryptedB.handles[0], encryptedB.inputProof);
    await tx.wait();

    const encryptedResult = await contract.getResult();
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedResult,
      contractAddress,
      signers.alice,
    );

    expect(decryptedResult).to.equal(a + b);
  });

  it("should add encrypted value to plaintext", async function () {
    const encrypted = 15;
    const plaintext = 25;

    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(encrypted)
      .encrypt();

    const tx = await contract.connect(signers.alice).addWithPlaintext(encryptedInput.handles[0], encryptedInput.inputProof, plaintext);
    await tx.wait();

    const result = await contract.getResult();
    const decryptedResult = await fhevm.userDecryptEuint(FhevmType.euint32, result, contractAddress, signers.alice);

    expect(decryptedResult).to.equal(encrypted + plaintext);
  });

  it("should add multiple encrypted values", async function () {
    const values = [5, 10, 15, 20];

    const encryptedInputs = await Promise.all(
      values.map((v) => fhevm.createEncryptedInput(contractAddress, signers.alice.address).add32(v).encrypt()),
    );

    const handles = encryptedInputs.map((enc) => enc.handles[0]);
    const proofs = encryptedInputs.map((enc) => enc.inputProof);

    const tx = await contract.connect(signers.alice).addMultiple(handles, proofs);
    await tx.wait();

    const result = await contract.getResult();
    const decryptedResult = await fhevm.userDecryptEuint(FhevmType.euint32, result, contractAddress, signers.alice);

    const expectedSum = values.reduce((a, b) => a + b, 0);
    expect(decryptedResult).to.equal(expectedSum);
  });
});
