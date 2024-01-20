const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PhirottoVault", function () {
  let factory;
  let token;
  let fakeWhitelist;

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PhirottoFactory", {
      signer: deployer,
    });
    const FakeWhitelist = await ethers.getContractFactory("FakeProver", {
      signer: deployer,
    });
    factory = await Factory.deploy();
    await factory.deployed();
    fakeWhitelist = await FakeWhitelist.deploy();
    await fakeWhitelist.deployed();
    const Token = await ethers.getContractFactory("TestGHOToken", {
      signer: deployer,
    });

    token = await Token.deploy();
    await token.deployed();
  });
  it("Test contract deplyment", async function () {
    const [deployer, admin] = await ethers.getSigners();
    let tx = await factory.functions.deployVault(
      "Test vault",
      fakeWhitelist.address,
      admin.address,
      10_000_000_000
    );

    await tx.wait();
  });

  it("Withdraw amount calculation", async function () {
    const [deployer, admin, staker] = await ethers.getSigners();

    let tx = await factory.functions.deployVault(
      "Test vault",
      fakeWhitelist.address,
      admin.address,
      10_000_000_000
    );

    await tx.wait();

    const vaultAdmin = await ethers.getContractAt(
      "PhirottoVault",
      await factory.vaultAddresses("Test vault"),
      admin
    );

    const vaultStaker = await ethers.getContractAt(
      "PhirottoVault",
      await factory.vaultAddresses("Test vault"),
      staker
    );

    tx = await vaultAdmin.functions.setGHO(token.address);
    await tx.wait();

    tx = await vaultStaker.functions.checkIn(
      staker.address,
      1_000_000_000,
      "0x"
    );

    await tx.wait();

    tx = await token.functions.mint(vaultStaker.address, 5_000_000_000);
    await tx.wait();

    let balanceBefore = await token.functions.balanceOf(staker.address);
    let balanceAfter = 0;

    tx = await vaultStaker.functions.withdrawUserStake();
    await tx.wait();

    balanceAfter = await token.functions.balanceOf(staker.address);
    expect(balanceAfter - balanceBefore).to.be.eq(1_000_000_000 / 2);

    // second topup

    tx = await token.functions.mint(vaultStaker.address, 5_000_000_000);
    await tx.wait();

    balanceBefore = await token.functions.balanceOf(staker.address);
    balanceAfter = 0;

    tx = await vaultStaker.functions.withdrawUserStake();
    await tx.wait();

    balanceAfter = await token.functions.balanceOf(staker.address);
    expect(balanceAfter - balanceBefore).to.be.eq(1_000_000_000 / 2);

    // third topup over required amount

    tx = await token.functions.mint(vaultStaker.address, 10_000_000_000);
    await tx.wait();

    balanceBefore = await token.functions.balanceOf(staker.address);
    balanceAfter = 0;

    tx = await vaultStaker.functions.withdrawUserStake();
    await tx.wait();

    balanceAfter = await token.functions.balanceOf(staker.address);
    expect(balanceAfter - balanceBefore).to.be.eq(1_000_000_000);
  });
});
