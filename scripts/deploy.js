const hre = require("hardhat");
const Big = require('big.js');

const erc20Json = require('../contractABIs/ERC20.json');

var currentGHOBridge = "0xE4A807726eD207Cb956fC10609978B3F39323763";
var currentPhirottoGateway = "0x77c3c4cC64e3BF9801AdF6370fF5C76eE27c61bE";
var currentPhirottoFactory = "0x8f7abeadfd935dbb878bebca7e694149c09e6f57";
const ghoSepoliaAddress = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60";
const treasuryAddress = "0xE665CEf14cB016b37014D0BDEAB4A693c3F46Cc0";

// Tokens for Gateway
const usdc = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
const usdt = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";
const dai = "0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357";

const verify = false
var deployer;

async function main() {
  const [fetchedDeployer] = await ethers.getSigners();
  deployer = fetchedDeployer

  console.log("Current account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Bridge setup
  // await deployBridger()
  // await bridgeGHOToOptimismSepolia()

  // Gateway setup
  // await deployPhirottoGateway()
  // await setupGatewayTokens()
  /* Before running this make sure you've made approval from L1 Vault to gateway address */
  // await setupFakeL2VaultAndBridgeTokens()

  // Factory setup
  // await deployPhirottoFactory()
}

async function deployBridger() {
  console.log("Deploying OptimismGHOBridge")
  const Bridger = await ethers.getContractFactory("OptimismGHOBridge");
  const contract = await Bridger.deploy();
  await contract.deployed();
  console.log("Address of Bridger:", contract.address);
  currentGHOBridge = contract.address

  if (!verify) { return }
  await delay(30000);
  try {
    await hre.run("verify:verify", {
        address: currentGHOBridge,
        network: hre.network,
        constructorArguments: []
    });
  } catch (error) {
      console.error(error);
      return contract
  }
}

async function deployPhirottoGateway() {
  console.log("Deploying Phirotto Gateway")
  if (hre.network.config.chainId != 11155111) {
    console.log(hre.network.config.chainId)
    console.log("Please switch to Sepolia")
    return
  }
  if (treasuryAddress == "" || currentGHOBridge == "") {
    console.log("Can't deploy PhirottoGateway without dependencies")
  }
  const Gateway = await ethers.getContractFactory("PhirottoGateway");
  const contract = await Gateway.deploy(
    treasuryAddress,
    currentGHOBridge
  );
  await contract.deployed();
  console.log("Address of Phirotto Gateway:", contract.address);
  currentPhirottoGateway = contract.address

  if (!verify) { return }
  await delay(30000);
  try {
    await hre.run("verify:verify", {
        address: currentPhirottoGateway,
        network: hre.network,
        constructorArguments: [
          treasuryAddress,
          currentGHOBridge
        ]
    });
  } catch (error) {
      console.error(error);
      return contract
  }
}

async function deployPhirottoFactory() {
  console.log("Deploying Phirotto Factory")
  if (hre.network.config.chainId != 11155420) {
    console.log(hre.network.config.chainId)
    console.log("Please switch to OP Sepolia")
    return
  }
  const Factory = await ethers.getContractFactory("PhirottoFactory");
  const contract = await Factory.deploy(
  );
  await contract.deployed();
  console.log("Address of Phirotto Factory on OP Sepolia:", contract.address);
  currentPhirottoFactory = contract.address

  if (!verify) { return }
  await delay(30000);
  try {
    await hre.run("verify:verify", {
        address: currentPhirottoFactory,
        network: hre.network,
        constructorArguments: [
        ]
    });
  } catch (error) {
      console.error(error);
      return contract
  }
}

async function setupGatewayTokens() {
  console.log("Setting up gateway tokens")
  if (currentPhirottoGateway == "") {
    console.log("Please deploy PhirottoGateway")
    return
  }
  const PhirottoGateway = await ethers.getContractFactory("PhirottoGateway");
  const contract = PhirottoGateway.attach(currentPhirottoGateway)
  let daiTx = await contract.addDepositToken(dai)
  await daiTx.wait();
  console.log('Dai add tx hash: ' + daiTx.hash);
  let usdcTx = await contract.addDepositToken(usdc)
  await usdcTx.wait();
  console.log('USDC add tx hash: ' + usdcTx.hash);
  let usdtTx = await contract.addDepositToken(usdt)
  await usdtTx.wait();
  console.log('USDT add tx hash: ' + usdtTx.hash);
}

async function setupFakeL2VaultAndBridgeTokens() {
  if (currentPhirottoGateway == "") {
    console.log("Please deploy PhirottoGateway")
    return
  }
  const amountToBridgeInUSD = '10' // 1
  const tokenAddress = dai; // Select token here
  const decimals = await getTokenDecimals(tokenAddress)
  const amountToBridge = Big(amountToBridgeInUSD).mul(Big(10).pow(decimals)).toString()
  console.log("Token bridge amount: " + amountToBridge)
  const tokenContract = await getTokenContract(tokenAddress)
  const allowance = await tokenContract.allowance(deployer.address, currentPhirottoGateway)
  if (Big(amountToBridge).gt(Big(allowance))) {
    console.log("Insufficient allowance, need approval")
    await approveToken(
      currentPhirottoGateway, // to
      amountToBridge, // amount
      tokenAddress
    );
  } else {
    console.log("Enough allowance, proceeding")
  }

  const Gateway = await ethers.getContractFactory("PhirottoGateway");
  const contract = Gateway.attach(currentPhirottoGateway)

  const vaultName = "FakeVault"
  const fakePhirottoVaultAddress = "0xE665CEf14cB016b37014D0BDEAB4A693c3F46Cc0";
  const existingVaultAddress = await contract.vaultAddressesL2(vaultName)
  if (existingVaultAddress == "0x0000000000000000000000000000000000000000") {
    console.log('Adding fake Phirotto Vault to gateway');
    let addVaultTx = await contract.addL2Vault(
      vaultName,
      fakePhirottoVaultAddress
    )
    await addVaultTx.wait();
    console.log('Add fake vault tx hash: ' + addVaultTx.hash);
  } else {
    console.log("Vault already exists, address: " + existingVaultAddress)
  }
  
  // Bridge
  console.log('Making bridge deposit');
  let bridgeTx = await contract.deposit(
    vaultName,
    tokenAddress,
    amountToBridgeInUSD
  )
  await bridgeTx.wait();
  console.log('Token bridge tx hash: ' + bridgeTx.hash);
}

async function bridgeGHOToOptimismSepolia() {
  if (currentGHOBridge == "") {
    console.log("please deploy bridger")
    return
  }
  const amountToBridge = '1000000000000000000' // 1
  await approveToken(
    currentGHOBridge, // to
    amountToBridge, // amount
    ghoSepoliaAddress
  );

  const Bridger = await ethers.getContractFactory("OptimismGHOBridge");
  const contract = Bridger.attach(currentGHOBridge)
  let tx = await contract.bridgeGHO(amountToBridge)
  await tx.wait();
  console.log('Token bridge tx hash: ' + tx.hash);
}

async function approveToken(
  spender,
  amount,
  tokenAddress,
  abi,
) {
  console.log("Approving token spend " + tokenAddress)
  let contract = await getTokenContract(tokenAddress);
  let tx = await contract.approve(spender, amount);
  await tx.wait();
  console.log('Approve token hash: ' + tx.hash);
}

async function getTokenDecimals(
  tokenAddress
) {
  let contract = await getTokenContract(tokenAddress);
  return await contract.decimals();
}

async function getTokenContract(address) {
  return new hre.ethers.Contract(address, erc20Json, deployer);
}

async function deployFactory(svgPath, scale) {
  const PhirottoFactory = await ethers.getContractFactory("PhirottoFactory", {
  });
  const contract = await PhirottoFactory.attach(
    currentFactoryAddress // The deployed contract address
  );

  // Now you can call functions of the contract
  const result = await contract.createVault(
  );
  console.log(result);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
