// Imports
const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("Fund Me Contract", async () => {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1");
  beforeEach(async () => {
    // Deploying using hardhat deploy
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    console.log(
      "-------------------------------------------------------------------------------"
    );
  });

  describe("Constructor Function", async () => {
    it("sets the aggregator address correctly", async () => {
      const reponse = await fundMe.priceFeed();
      assert.equal(reponse, mockV3Aggregator.address);
    });
  });

  describe("Fund Function", async () => {
    it("Fails when not enough Eth is sent", async () => {
      await expect(fundMe.fund()).to.be.reverted;
    });

    it("Updates the Amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adds Funders to array of funders", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);

      assert.equal(funder, deployer);
    });
  });

  describe("Withdraw Function", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw Eth from single Funder", async () => {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Gas Cost
      const gasCost = gasUsed.mul(effectiveGasPrice);
      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("Withdraw Function works with Multiple Funders", async () => {
      const accounts = await ethers.getSigners();

      // arrange
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.funders(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        const funderMappedAmount = await fundMe.addressToAmountFunded(
          accounts[i].address
        );
        assert.equal(funderMappedAmount, 0);
      }
    });

    it("Allows only owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "fundme__NotOwner");
    });
  });

  // Cheaper Withdraw Funciton

  describe("Cheaper Withdraw Function", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("Cheaper", async () => {
      const accounts = await ethers.getSigners();

      // arrange
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Act
      const transactionResponse = await fundMe.cheaper_withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.funders(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        const funderMappedAmount = await fundMe.addressToAmountFunded(
          accounts[i].address
        );
        assert.equal(funderMappedAmount, 0);
      }
    });
  });
});
