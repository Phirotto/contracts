const hre = require("hardhat");
const erc20Json = require('../contractABIs/ERC20.json');

var currentBridgerAddress = "0x82132931444E7A1b9283b80b0e5C5D7a320c425a";
var ghoSepoliaAddress = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60";

const verify = false
var deployer;

async function main() {
  const [fetchedDeployer] = await ethers.getSigners();
  deployer = fetchedDeployer

  console.log("Current account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // await deployBridger()
  await bridgeGHOToOptimismSepolia()
}

async function deployBridger() {
  const Bridger = await ethers.getContractFactory("L1OptimismBridger");
  const contract = await Bridger.deploy();
  await contract.deployed();
  console.log("Address of Bridger:", contract.address);
  currentBridgerAddress = contract.address

  await delay(30000);
  try {
    await hre.run("verify:verify", {
        address: currentBridgerAddress,
        network: hre.network,
        constructorArguments: []
    });
} catch (error) {
    console.error(error);
    return contract
}
}

async function bridgeGHOToOptimismSepolia() {
  if (currentBridgerAddress == "") {
    console.log("please deploy bridger")
    return
  }
  const amountToBridge = '1000000000000000000' // 1
  await approveToken(
    currentBridgerAddress, // to
    amountToBridge, // amount
    ghoSepoliaAddress,
    erc20Json,
  );

  const Bridger = await ethers.getContractFactory("L1OptimismBridger");
  const contract = Bridger.attach(currentBridgerAddress)
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
  let contract = await getContract(tokenAddress, abi);
  let tx = await contract.approve(spender, amount);
  await tx.wait();
  console.log('Approve token hash: ' + tx.hash);
}

async function getContract(address, abi) {
  return new hre.ethers.Contract(address, abi, deployer);
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
