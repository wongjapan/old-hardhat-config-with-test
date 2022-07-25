const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deadAddress, zeroAddress } = require("./helpers/address");
const {
  utils,
  parseUnits,
  formatUnits,
  MaxUint256,
  EMPIRE_TOTAL_SUPPLY,
  AIRDROP_VALUE,
  INITIAL_BNB_LIQUIDITY,
  INITIAL_EMPIRE_LIQUIDITY,
  DEFAULT_EMPIRE_TRANSFER,
  SWAP_VALUE,
} = require("./helpers/utils");
const { uniswapV2PairAbi } = require("./helpers/abi");

const airdropValue = ethers.utils.parseUnits("200000", 9);
const mintValue = ethers.utils.parseUnits("20000", 9);
const burnValue = ethers.utils.parseUnits("2000", 9);

describe("Empire Token Interaction with bridge", function () {
  let pancakeDeployer;
  let pancakeFeeReceiver;
  let empireDeployer;
  let empireTeam;
  let empireMarketing;
  let bridgeValidator;
  let bridgeFeeReceiver;
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
  let newWallet;
  let emptyAddr;
  let bridgeAddr;
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
      bridgeAddr,
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
    // let's assume we finish presale, so I enable trading on each test
    await token.connect(empireDeployer).setEnableTrading(true);
    await token.connect(empireDeployer).setBridge(bridgeAddr.address);

    // airdrop for client
    await token
      .connect(empireDeployer)
      .transfer(bridgeVault.address, mintValue);
    await token.connect(empireDeployer).transfer(client1.address, airdropValue);
    await token.connect(empireDeployer).transfer(client2.address, airdropValue);
    await token.connect(empireDeployer).transfer(client3.address, airdropValue);
    await token.connect(empireDeployer).transfer(client4.address, airdropValue);
    await token.connect(empireDeployer).transfer(client5.address, airdropValue);
  });

  describe("Check Lock and Unlock from Bridge", function () {
    it("Correct balance change after lock", async function () {
      const client1_balance = await token.balanceOf(client1.address);
      const client2_balance_before = await token.balanceOf(client2.address);
      const bridgeVault_balance_before = await token.balanceOf(
        bridgeVault.address
      );
      const initTotalSupply = await token.totalSupply();
      const initCircSupply = await token.circulatingSupply();

      expect(initTotalSupply).to.equal(
        initCircSupply.add(bridgeVault_balance_before)
      );
      expect(client1_balance).to.equal(airdropValue);

      // this check should be fine before final version
      // I comment because now bridge doesn'n need approval
      // expect(token.connect(bridgeAddr).lock(client1.address, burnValue)).to.be
      // .reverted;

      await token.connect(client1).approve(bridgeAddr.address, burnValue);
      await token.connect(bridgeAddr).lock(client1.address, burnValue);

      const client1_balance_after = await token.balanceOf(client1.address);
      const client2_balance_after_burn = await token.balanceOf(client2.address);
      const totalSupplyAfter = await token.totalSupply();
      const circSupplyAfter = await token.circulatingSupply();
      const bridgeVault_balance_after = await token.balanceOf(
        bridgeVault.address
      );

      expect(initTotalSupply).to.equal(totalSupplyAfter);
      expect(circSupplyAfter).to.equal(initCircSupply.sub(burnValue));
      expect(bridgeVault_balance_after).to.equal(
        bridgeVault_balance_before.add(burnValue)
      );
      expect(client2_balance_before).to.equal(client2_balance_after_burn);
      expect(client1_balance_after).to.equal(client1_balance.sub(burnValue));
    });

    it("Correct balance change after unlock", async function () {
      const client1_balance = await token.balanceOf(client1.address);
      const client2_balance_before = await token.balanceOf(client2.address);
      const bridgeVault_balance_before = await token.balanceOf(
        bridgeVault.address
      );
      const initTotalSupply = await token.totalSupply();
      const initCircSupply = await token.circulatingSupply();

      expect(initTotalSupply).to.equal(
        initCircSupply.add(bridgeVault_balance_before)
      );

      await token.connect(bridgeAddr).unlock(client1.address, burnValue);

      const client1_balance_after = await token.balanceOf(client1.address);
      const client2_balance_after_mint = await token.balanceOf(client2.address);
      const totalSupplyAfter = await token.totalSupply();
      const circSupplyAfter = await token.circulatingSupply();
      const bridgeVault_balance_after = await token.balanceOf(
        bridgeVault.address
      );

      expect(initTotalSupply).to.equal(totalSupplyAfter);
      expect(circSupplyAfter).to.equal(initCircSupply.add(burnValue));
      expect(bridgeVault_balance_after).to.equal(
        bridgeVault_balance_before.sub(burnValue)
      );
      expect(client1_balance_after).to.equal(client1_balance.add(burnValue));
      expect(client2_balance_before).to.equal(client2_balance_after_mint);
    });
  });
});
