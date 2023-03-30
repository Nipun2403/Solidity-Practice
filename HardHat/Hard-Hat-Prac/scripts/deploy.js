// Import

const { ethers, run, network } = require("hardhat");

// Async Main Function
async function main() {
  const simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");

  console.log("Deploying Contract...");

  const simpleStorage = await simpleStorageFactory.deploy();
  await simpleStorage.deployed();

  console.log(`Deployed Contract to: ${simpleStorage.address}`);

  // Veryfing Contract
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, [])
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is : ${currentValue}`);

  // Update the current Value
  const transactionResponse = await simpleStorage.store(11);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is : ${updatedValue}`);

}

// Verify Function
async function verify(contractAddress, args) {
  console.log("Verifying Contract....");
  try {

    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    }
    else {
      console.log(e);
    }
  }
}

// Call Main

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


