const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deadAddress } = require("./helpers/address");
const { EMPIRE_TOTAL_SUPPLY } = require("./helpers/utils");
const { uniswapV2PairAbi } = require("./helpers/abi");

describe("Empire Token Deployment Test", function () {
  let pancakeDeployer;
  let pancakeFeeReceiver;
  let empireDeployer;
  let empireTeam;
  let empireMarketing;
  let bridgeValidator;
  let bridgeFeeReceiver;
  let addrs;

  /**
   * pancakeswap utilities
   */
  let pancakeFactoryContract;
  let pancakeRouterContract;
  let pancakePairContract;
  let wbnbContract;

  /**
   * bridgeVault stand for EMPIRE BRIDGE VAULT
   * token is stand for EMPIRE Token
   */
  let bridgeVault;
  let token;

  /**
   * bridge stand for bridge contract
   */
  let bridge;

  let buyPath;
  let sellPath;

  /**
   * we want to test empire with PancakeSwap local chain
   * so we deploy PancakeSwap contract to local chain before running test
   *
   */
  before(async function () {
    // get signers
    [
      pancakeDeployer,
      pancakeFeeReceiver,
      empireDeployer,
      empireTeam,
      empireMarketing,
      bridgeValidator,
      bridgeFeeReceiver,
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
      newWallet,
      emptyAddr,
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
    const RouterContract = await ethers.getContractFactory("PancakeRouter");
    pancakeRouterContract = await RouterContract.deploy(
      pancakeFactoryContract.address,
      wbnbContract.address
    );
    await pancakeRouterContract.deployed();

    // deploy bridgeVault and EMPIRE
    const EmpireBridgeVault = await ethers.getContractFactory(
      "EmpireBridgeVault",
      empireDeployer
    );
    bridgeVault = await EmpireBridgeVault.deploy();
    await bridgeVault.deployed();

    const Token = await ethers.getContractFactory(
      "EmpireToken",
      empireDeployer
    );
    token = await Token.deploy(
      pancakeRouterContract.address,
      empireMarketing.address,
      empireTeam.address,
      bridgeVault.address
    );
    await token.deployed();

    /**
     * bridge deployed by empire deployer
     */
    const BridgeContract = await ethers.getContractFactory(
      "Bridge",
      empireDeployer
    );

    // deploy bridge
    bridge = await BridgeContract.deploy(
      bridgeValidator.address,
      bridgeFeeReceiver.address
    );
    await bridge.deployed();

    pairAddress = await pancakeFactoryContract.getPair(
      wbnbContract.address,
      token.address
    );

    pairContract = new ethers.Contract(
      pairAddress,
      uniswapV2PairAbi,
      ethers.provider
    );

    buyPath = [wbnbContract.address, token.address];
    sellPath = [token.address, wbnbContract.address];
  });

  it("Has a correct name 'EmpireToken'", async function () {
    expect(await token.name()).to.equal("EmpireToken");
  });

  it("Has a correct symbol 'EMPIRE'", async function () {
    expect(await token.symbol()).to.equal("EMPIRE");
  });

  it("Has 9 decimals", async function () {
    expect(await token.decimals()).to.equal(9);
  });

  it("Has 1 billion tokens with 9 decimal units (10^18)", async function () {
    expect(await token.totalSupply()).to.equal(EMPIRE_TOTAL_SUPPLY);
  });

  it("Correct Marketing address wallet", async function () {
    expect(await token.marketingWallet()).to.equal(empireMarketing.address);
  });

  it("Correct Team address wallet", async function () {
    expect(await token.teamWallet()).to.equal(empireTeam.address);
  });

  it("Correct Liquidity address wallet set to Deployer Address", async function () {
    expect(await token.liquidityWallet()).to.equal(empireDeployer.address);
  });

  it("Correct Dead (burn) address wallet", async function () {
    expect(await token.burnWallet()).to.equal(deadAddress);
  });

  it("Trading is disabled by default", async function () {
    expect(await token.isTradingEnabled()).to.equal(false);
  });

  it("All Empire Token supply send to deployer address", async function () {
    expect(await token.balanceOf(empireDeployer.address)).to.equal(
      EMPIRE_TOTAL_SUPPLY
    );
  });
});
