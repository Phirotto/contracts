const hre = require("hardhat");

var currentFactoryAddress = "";

const verify = false

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Uncomment if you'd like to just mint, include return, remember to set the addresses above
  // await mintToken(elvis, elvisScale)
  // await mintToken(phone, phoneScale)
  // return

  /* Unneeded since we don't setup an external library link yet
  if (dateTimeLibrary == "") {
    const TimeLibrary = await ethers.getContractFactory("BokkyPooBahsDateTimeLibrary");
    const timeLibrary = await TimeLibrary.deploy();
    await timeLibrary.deployed();
    console.log("Address of TimeLibrary:", timeLibrary.address);
    dateTimeLibrary = timeLibrary.address

    await delay(20000);
    await hre.run("verify:verify", {
      address: dateTimeLibrary,
      contract: "contracts/libraries/BokkyPooBahsDateTimeLibrary.sol:BokkyPooBahsDateTimeLibrary",
      constructorArguments: [
      ],
      libraries: {
      }
    });
  }
  */

}

async function deployFactory(svgPath, scale) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

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
