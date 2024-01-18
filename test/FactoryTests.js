const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PhirottoFactory", function () {
  it("Test contract deplyment", async function () {

    const OnchainArt = await ethers.getContractFactory("PhirottoFactory", {
    });
    const onchainArt = await OnchainArt.deploy(
    );
    await onchainArt.deployed();
  });
});
