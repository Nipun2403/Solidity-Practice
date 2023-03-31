// Imports
const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

// Exporting Function
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainIds;

  const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

  // If the contract doesn't exist, we deploy a minimal mock version of that contract for local testing
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [
      /*Address*/
    ],
  });
};
