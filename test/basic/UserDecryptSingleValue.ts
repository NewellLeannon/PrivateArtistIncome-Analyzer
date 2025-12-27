import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { UserDecryptSingleValue, UserDecryptSingleValue__factory } from "../../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("UserDecryptSingleValue", function () {
  let signers: Signers;
  let contract: UserDecryptSingleValue;
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

    const factory = (await ethers.getContractFactory("UserDecryptSingleValue")) as UserDecryptSingleValue__factory;
    contract = (await factory.deploy()) as UserDecryptSingleValue;
    contractAddress = await contract.getAddress();
  });

  it("should submit encrypted secret", async function () {
    const secret = 12345;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(secret)
      .encrypt();

    const tx = await contract.connect(signers.alice).submitSecret(encrypted.handles[0], encrypted.inputProof);

    await expect(tx).to.emit(contract, "SecretStored").withArgs(signers.alice.address, await ethers.provider.getBlock("latest").then((b) => b?.timestamp));
  });

  it("alice should decrypt her own secret", async function () {
    const secret = 99999;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(secret)
      .encrypt();

    await contract.connect(signers.alice).submitSecret(encrypted.handles[0], encrypted.inputProof);

    const handle = await contract.connect(signers.alice).getMySecret();

    const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, handle, contractAddress, signers.alice);

    expect(decrypted).to.equal(secret);
  });

  it("should update secret", async function () {
    const secret1 = 111;
    const secret2 = 222;

    let encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(secret1)
      .encrypt();

    await contract.connect(signers.alice).submitSecret(encrypted.handles[0], encrypted.inputProof);

    encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(secret2)
      .encrypt();

    await contract.connect(signers.alice).updateSecret(encrypted.handles[0], encrypted.inputProof);

    const handle = await contract.connect(signers.alice).getMySecret();

    const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, handle, contractAddress, signers.alice);

    expect(decrypted).to.equal(secret2);
  });

  it("should perform operation on user's secret", async function () {
    const secret = 100;
    const operand = 50;

    const secretEnc = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(secret)
      .encrypt();

    await contract.connect(signers.alice).submitSecret(secretEnc.handles[0], secretEnc.inputProof);

    const operandEnc = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(operand)
      .encrypt();

    const tx = await contract.connect(signers.alice).addToMySecret(operandEnc.handles[0], operandEnc.inputProof);

    const result = await tx.wait();
    expect(result).to.not.be.null;
  });

  it("different users should have separate secrets", async function () {
    const aliceSecret = 111;
    const bobSecret = 222;

    const aliceEnc = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(aliceSecret)
      .encrypt();

    await contract.connect(signers.alice).submitSecret(aliceEnc.handles[0], aliceEnc.inputProof);

    const bobEnc = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add32(bobSecret)
      .encrypt();

    await contract.connect(signers.bob).submitSecret(bobEnc.handles[0], bobEnc.inputProof);

    const aliceHandle = await contract.connect(signers.alice).getMySecret();
    const bobHandle = await contract.connect(signers.bob).getMySecret();

    const aliceDecrypted = await fhevm.userDecryptEuint(FhevmType.euint32, aliceHandle, contractAddress, signers.alice);

    const bobDecrypted = await fhevm.userDecryptEuint(FhevmType.euint32, bobHandle, contractAddress, signers.bob);

    expect(aliceDecrypted).to.equal(aliceSecret);
    expect(bobDecrypted).to.equal(bobSecret);
    expect(aliceDecrypted).to.not.equal(bobDecrypted);
  });
});
