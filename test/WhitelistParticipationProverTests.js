const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WhitelistParticipationProver", function () {
  it("Test contract deployment", async function () {
    const OnchainArt = await ethers.getContractFactory(
      "WhitelistParticipationProver",
      {}
    );

    const values = [
      ["0x1111111111111111111111111111111111111111", "5000000000000000000"],
      ["0x2222222222222222222222222222222222222222", "2500000000000000000"],
    ];

    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

    const onchainArt = await OnchainArt.deploy(tree.root);
    await onchainArt.deployed();
  });

  it("Should detect whitelist accounts", async function () {
    const [deployer, whitelistedAccount, whitelistedWithDifferentAmount] =
      await ethers.getSigners();
    const whitelistedAmount = "5000000000000000000";

    const OnchainArt = await ethers.getContractFactory(
      "WhitelistParticipationProver",
      {
        signer: deployer,
      }
    );

    const values = [
      [whitelistedAccount.address, whitelistedAmount],
      [whitelistedWithDifferentAmount.address, "2500000000000000000"],
      ["0x2222222222222222222222222222222222222222", "2500000000000000000"],
    ];

    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

    const onchainArt = await OnchainArt.deploy(tree.root);
    await onchainArt.deployed();

    let proof;

    for (const [i, v] of tree.entries()) {
      if (v[0] === whitelistedAccount.address) {
        proof = tree.getProof(i);
      }
    }

    let [isWhitelisted] = await onchainArt.functions.hasParticipated(
      whitelistedAccount.address,
      whitelistedAmount,
      ethers.utils.defaultAbiCoder.encode(["bytes32[]"], [proof])
    );

    expect(isWhitelisted).to.be.true;

    for (const [i, v] of tree.entries()) {
      if (v[0] === whitelistedWithDifferentAmount.address) {
        proof = tree.getProof(i);
      }
    }

    [isWhitelisted] = await onchainArt.functions.hasParticipated(
      whitelistedWithDifferentAmount.address,
      whitelistedAmount,
      ethers.utils.defaultAbiCoder.encode(["bytes32[]"], [proof])
    );

    expect(isWhitelisted).to.be.false;
  });
});
