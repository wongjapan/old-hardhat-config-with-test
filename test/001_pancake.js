const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Pancake Factory Deploy", function () {
  let pancakeDeployer;
  let pancakeFeeReceiver;
  let client1;
  let client2;
  let client3;
  let client4;
  let client5;
  let client6;
  let client7;
  let client8;
  let client9;
  let client10;
  let addrs;

  let pancakeFactoryContract;
  let pancakeRouterContract;
  let pancakePairContract;
  let wbnbContract;

  before(async function () {
    // get signers
    [
      pancakeDeployer,
      pancakeFeeReceiver,
      client1,
      client2,
      client3,
      client4,
      client5,
      client6,
      client7,
      client8,
      client9,
      client10,
      ...addrs
    ] = await ethers.getSigners();

    // deploy pancake factory first
    const PancakeFactory = await ethers.getContractFactory("PancakeFactory");
    pancakeFactoryContract = await PancakeFactory.deploy(
      pancakeFeeReceiver.address
    );
    await pancakeFactoryContract.deployed();

    // deploy WBNB factory first
    const WBNBContract = await ethers.getContractFactory("WBNB");
    wbnbContract = await WBNBContract.deploy();
    await wbnbContract.deployed();

    // deploy Pancake Router first
    const routerContract = await ethers.getContractFactory("PancakeRouter");
    pancakeRouterContract = await routerContract.deploy(
      pancakeFactoryContract.address,
      wbnbContract.address
    );
    await pancakeRouterContract.deployed();
  });

  it("Get INIT_CODE_PAIR_HASH", async function () {
    const INIT_CODE_PAIR_HASH =
      await pancakeFactoryContract.INIT_CODE_PAIR_HASH();

    console.log(
      `Please Change init pair hash on \`contracts/uniswap/libraries/PancakeLibrary.sol\` at line 38 to ${INIT_CODE_PAIR_HASH} without \`0x\` before run complete test`
    );
  });
});
