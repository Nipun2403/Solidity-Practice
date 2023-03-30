const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", () => {
  let simpleStorage, simpleStorageFactory;

  // Code to run before each of the tests
  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  // Code for each of the test
  it("Should Start with a favorite number : 0", async () => {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";

    // Using Assert
    assert.equal(currentValue.toString(), expectedValue);

    // Using Expect
    // expect(currentValue.toString()).to.equal(expectedValue);
  });

  it("Should Update when Store is called", async () => {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);
    const currentValue = await simpleStorage.retrieve();
    assert.equal(currentValue.toString(), expectedValue);
  });

  it("Should Say Name : Jatin and favourite Number : 20", async () => {
    const expectedValue = "20";
    const transactionResponse = await simpleStorage.addPerson("jatin", "20");
    await transactionResponse.wait(1);
    const currentValue = await simpleStorage.nameToFavoriteNumber("jatin");
    assert.equal(currentValue.toString(), expectedValue);
  });
});
