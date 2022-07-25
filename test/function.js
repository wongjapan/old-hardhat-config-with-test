const { expect } = require("chai");
const { ethers } = require("hardhat");

const { zeroAddress } = require("./helpers/address");
const {
  parseUnits,

  EMPIRE_TOTAL_SUPPLY,
} = require("./helpers/utils");
const { uniswapV2PairAbi } = require("./helpers/abi");

describe("Empire Token Write Function Test", function () {
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

  describe("Public Write Methods", function () {
    describe("Approval Function", function () {
      it("Should emit Approval events", async function () {
        expect(
          token.connect(client1).approve(bridge.address, EMPIRE_TOTAL_SUPPLY)
        )
          .to.emit(token.address, "Approval")
          .withArgs(client1.address, bridge.address, EMPIRE_TOTAL_SUPPLY);
      });
      it("Spender Can't be ZERO Address (0x)", async function () {
        expect(
          token.connect(client1).approve(zeroAddress, EMPIRE_TOTAL_SUPPLY)
        ).to.be.revertedWith("ERC20: approve to the zero address");
      });
    });
    describe("Increase Allowance Function", function () {
      const INCREASE_VALUE = parseUnits("10000", 9);
      it("Should emit Approval events", async function () {
        expect(
          token
            .connect(client1)
            .increaseAllowance(bridge.address, INCREASE_VALUE)
        )
          .to.emit(token.address, "Approval")
          .withArgs(client1.address, bridge.address, INCREASE_VALUE);
      });

      it("Spender Can't be ZERO Address (0x)", async function () {
        expect(
          token.connect(client1).approve(zeroAddress, INCREASE_VALUE)
        ).to.be.revertedWith("ERC20: approve to the zero address");
      });
    });

    describe("Decrease Allowance Function", function () {
      const INITIAL_ALLOWANCE = parseUnits("10000", 9);
      const VALID_DECREASE_VALUE = parseUnits("1000", 9);
      const INVALID_DECREASE_VALUE = parseUnits("100000", 9);

      beforeEach(async function () {
        token.connect(client1).approve(bridge.address, INITIAL_ALLOWANCE);
      });

      it("Should emit Approval events", async function () {
        expect(
          token
            .connect(client1)
            .decreaseAllowance(bridge.address, VALID_DECREASE_VALUE)
        )
          .to.emit(token.address, "Approval")
          .withArgs(
            client1.address,
            bridge.address,
            INITIAL_ALLOWANCE.sub(VALID_DECREASE_VALUE)
          );
      });

      it("Allowance MUST not below 0 (zero)", async function () {
        expect(
          token
            .connect(client1)
            .decreaseAllowance(zeroAddress, INVALID_DECREASE_VALUE)
        ).to.be.revertedWith("ERC20: decreased allowance below zero");
      });
    });

    describe("Deliver Function", function () {
      const DELIVER_AMOUNT = parseUnits("1000", 9);
      it("Should emit LogDeliver events", async function () {
        expect(token.connect(empireDeployer).deliver(DELIVER_AMOUNT))
          .to.emit(token.address, "LogDeliver")
          .withArgs(empireDeployer.address, DELIVER_AMOUNT);
      });

      it("Deliver function can't be call by excluded from reward address", async function () {
        await token.connect(empireDeployer).excludeFromReward(client2.address);
        expect(
          token.connect(client2).deliver(DELIVER_AMOUNT)
        ).to.be.revertedWith("Excluded addresses cannot call this function");
      });
    });
  });

  describe("Only Owner Write Methods", function () {
    describe("excludeFromReward Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).excludeFromReward(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogExcludeFromReward event", async function () {
        expect(
          await token
            .connect(empireDeployer)
            .excludeFromReward(newWallet.address)
        )
          .to.emit(token.address, "LogExcludeFromReward")
          .withArgs(newWallet.address);
      });

      it("Function should correct change state", async function () {
        await token.connect(empireDeployer).excludeFromReward(client10.address);

        expect(
          await token
            .connect(empireDeployer)
            .isExcludedFromReward(client10.address)
        ).to.be.equal(true);
      });
    });

    describe("includeInReward Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).includeInReward(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should Reverted if already include in reward", async function () {
        // we include first
        await token.connect(empireDeployer).includeInReward(newWallet.address);
        // check if already included
        await expect(
          token.connect(empireDeployer).includeInReward(newWallet.address)
        ).to.be.revertedWith("Account is already included");
      });

      it("Should emit LogIncludeInReward event", async function () {
        // first need exclude wallet,
        await token
          .connect(empireDeployer)
          .excludeFromReward(newWallet.address);
        expect(
          await token.connect(empireDeployer).includeInReward(newWallet.address)
        )
          .to.emit(token.address, "LogIncludeInReward")
          .withArgs(newWallet.address);
      });

      it("Function should correct change state", async function () {
        await token.connect(empireDeployer).excludeFromReward(client9.address);
        await token.connect(empireDeployer).includeInReward(client9.address);
        expect(
          await token
            .connect(empireDeployer)
            .isExcludedFromReward(client9.address)
        ).to.be.equal(false);
      });
    });

    describe("setAutomatedMarketMakerPair Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token
            .connect(client1)
            .setAutomatedMarketMakerPair(newWallet.address, true)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetAutomatedMarketMakerPair event", async function () {
        expect(
          await token
            .connect(empireDeployer)
            .setAutomatedMarketMakerPair(newWallet.address, true)
        )
          .to.emit(token.address, "LogSetAutomatedMarketMakerPair")
          .withArgs(newWallet.address, true);
      });

      it("Function should correct change state", async function () {
        await token
          .connect(empireDeployer)
          .setAutomatedMarketMakerPair(newWallet.address, false);

        expect(
          await token.automatedMarketMakerPairs(newWallet.address)
        ).to.be.equal(false);

        await token
          .connect(empireDeployer)
          .setAutomatedMarketMakerPair(newWallet.address, true);
        expect(
          await token.automatedMarketMakerPairs(newWallet.address)
        ).to.be.equal(true);
      });
    });

    describe("setBridge Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setBridge(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should Reverted if bridge address is same with current bridge address", async function () {
        await token.connect(empireDeployer).setBridge(newWallet.address);
        await expect(
          token.connect(empireDeployer).setBridge(newWallet.address)
        ).to.be.revertedWith("Same Bridge!");
      });

      it("Should emit LogSetBridge event", async function () {
        expect(token.connect(empireDeployer).setBridge(newWallet.address))
          .to.emit(token.address, "LogSetBridge")
          .withArgs(empireDeployer.address, newWallet.address);
      });
    });

    describe("setBurnWallet Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setBurnWallet(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetBridge event", async function () {
        expect(
          await token.connect(empireDeployer).setBurnWallet(newWallet.address)
        )
          .to.emit(token.address, "LogSetBridge")
          .withArgs(newWallet.address);
      });
    });

    describe("setBuyFees Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setBuyFees(1, 1, 1, 1, 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetBuyFees event", async function () {
        expect(
          await token.connect(empireDeployer).setBuyFees(2, 2, 2, 2, 2)
        ).to.emit(token.address, "LogSetBuyFees");
      });
    });

    describe("setSellFees Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setSellFees(1, 1, 1, 1, 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetSellFees event", async function () {
        expect(
          await token.connect(empireDeployer).setSellFees(2, 2, 2, 2, 2)
        ).to.emit(token.address, "LogSetSellFees");
      });
    });

    describe("setEnableTrading Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setEnableTrading(true)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetEnableTrading event", async function () {
        expect(await token.connect(empireDeployer).setEnableTrading(true))
          .to.emit(token.address, "LogSetEnableTrading")
          .withArgs(true);
        expect(await token.connect(empireDeployer).setEnableTrading(false))
          .to.emit(token.address, "LogSetEnableTrading")
          .withArgs(false);
        expect(await token.connect(empireDeployer).setEnableTrading(true))
          .to.emit(token.address, "LogSetEnableTrading")
          .withArgs(true);
      });
    });

    describe("setExcludeFromFee Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setExcludeFromFee(newWallet.address, true)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetExcludeFromFee event", async function () {
        expect(
          await token
            .connect(empireDeployer)
            .setExcludeFromFee(newWallet.address, true)
        )
          .to.emit(token.address, "LogSetExcludeFromFee")
          .withArgs(empireDeployer.address, newWallet.address, true);
        expect(
          await token
            .connect(empireDeployer)
            .setExcludeFromFee(newWallet.address, false)
        )
          .to.emit(token.address, "LogSetExcludeFromFee")
          .withArgs(empireDeployer.address, newWallet.address, false);
      });
    });

    describe("setMarketingWallet Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setMarketingWallet(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetMarketingWallet event", async function () {
        expect(
          await token
            .connect(empireDeployer)
            .setMarketingWallet(newWallet.address)
        )
          .to.emit(token.address, "LogSetMarketingWallet")
          .withArgs(empireDeployer.address, newWallet.address);
      });
    });

    describe("setTeamWallet Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setTeamWallet(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetTeamWallet event", async function () {
        expect(
          await token.connect(empireDeployer).setTeamWallet(newWallet.address)
        )
          .to.emit(token.address, "LogSetTeamWallet")
          .withArgs(empireDeployer.address, newWallet.address);
      });
    });

    describe("setRouterAddress Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setRouterAddress(newWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetRouterAddress event", async function () {
        expect(
          await token
            .connect(empireDeployer)
            .setRouterAddress(newWallet.address)
        )
          .to.emit(token.address, "LogSetRouterAddress")
          .withArgs(empireDeployer.address, newWallet.address);
      });
    });

    describe("setSwapAndLiquifyEnabled Function", function () {
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setSwapAndLiquifyEnabled(true)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSwapAndLiquifyEnabledUpdated event", async function () {
        expect(
          await token.connect(empireDeployer).setSwapAndLiquifyEnabled(false)
        )
          .to.emit(token.address, "LogSwapAndLiquifyEnabledUpdated")
          .withArgs(empireDeployer.address, false);
        expect(
          await token.connect(empireDeployer).setSwapAndLiquifyEnabled(true)
        )
          .to.emit(token.address, "LogSwapAndLiquifyEnabledUpdated")
          .withArgs(empireDeployer.address, true);
      });
    });

    describe("setSwapTokensAmount Function", function () {
      const TOKEN_AMOUNT = parseUnits("10000", 9);
      it("Only deployer can use this function", async function () {
        await expect(
          token.connect(client1).setSwapTokensAmount(TOKEN_AMOUNT)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should emit LogSetSwapTokensAmount event", async function () {
        expect(
          await token.connect(empireDeployer).setSwapTokensAmount(TOKEN_AMOUNT)
        )
          .to.emit(token.address, "LogSetSwapTokensAmount")
          .withArgs(empireDeployer.address, TOKEN_AMOUNT);
      });
    });
  });
});
