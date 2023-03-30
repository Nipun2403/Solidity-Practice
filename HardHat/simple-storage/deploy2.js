// Import Ethers.js
const ethers = require("ethers");
const fs = require("fs-extra");

require("dotenv").config();

async function main() {
  // Complie

  // Connection to BlockChain
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  // Connection To the wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const encryptedJson = fs.readFileSync("./.encrypted.json", "utf8");

  // let wallet = new ethers.Wallet.fromEncryptedJsonSync(
  //   encryptedJson,
  //   process.env.PRIVATE_KEY_PASSWORD
  // );

  // wallet = await wallet.connect(provider);

  // Getting abi file
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");

  // Getting binary file
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  );

  // Createas a contract
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying");
  const contract = await contractFactory.deploy(); // Stop and wait for this contract to load

  await contract.deploymentTransaction().wait(1);
  console.log(`contract Address : ${await contract.getAddress()}`);

  const transactionResponse = await contract.store("7");
  const transactionReceit = await transactionResponse.wait(1);

  const currentFavoriteNumber = await contract.retrieve();
  console.log(`Current Favorite Number : ${currentFavoriteNumber.toString()}`);
}

// Checking and logging error for Main Function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
