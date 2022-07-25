const { expect } = require("chai");
const { ethers } = require("hardhat");
// const dotenv = require("dotenv");

const {
  uniswapV2RouterAddress,
  ethAddress,
  bnbAddress,
} = require("./helpers/address");
const {
  parseUnits,
  formatUnits,
  AIRDROP_VALUE,
  SWAP_VALUE,
  MaxUint256,
} = require("./helpers/utils");

const INITIAL_VAULT_BALANCE = parseUnits("2000000", 9);
const UNLOCK_VALUE = parseUnits("20000", 9);
const LOCK_VALUE = parseUnits("20000", 9);

const TX_HASH =
  "0x0df1e1e733b4d468db04cb6b6793a1c641099452bb20bc577e8dc31a8658fba9";

const SWAP_CHAIN = 3;

const OLD_FEE = parseUnits("0.0001", 18);
const WRONG_FEE = parseUnits("0.00001", 18);
const NEW_FEE = parseUnits("0.5", 18);

const OLD_MIN_AMOUNT = 1;
const OLD_MAX_AMOUNT = 10000;

const NEW_MIN_AMOUNT = 1000;
const NEW_MAX_AMOUNT = 100000;

describe("Bridge Contract Test Case", function () {
  let deployer;
  let marketingWallet;
  let teamWallet;
  let client1;
  let client2;
  let client3;
  let client4;
  let client5;
  let client6;
  let client7;
  let client8;
  let pancakeDeployer;
  let pancakeFeeReceiver;
  let emptyAddr;
  let newWallet;
  let addrs;
  let bridge_validator;
  let bridge_treasury;
  let new_bridge_validator;
  let new_bridge_treasury;

  /**
   * pancakeswap utilities
   */
  let pancakeFactoryContract;
  let pancakeRouterContract;
  let pancakePairContract;
  let wbnbContract;

  let bridge;
  let bridgeVault;
  let token;
  let provider;

  beforeEach(async function () {
    // Get signers
    [
      deployer,
      marketingWallet,
      teamWallet,
      client1,
      client2,
      client3,
      client4,
      client5,
      client6,
      client7,
      client8,
      pancakeDeployer,
      pancakeFeeReceiver,
      new_bridge_validator,
      new_bridge_treasury,
      bridge_validator,
      bridge_treasury,
      emptyAddr,
      newWallet,
      ...addrs
    ] = await ethers.getSigners();
    // Deploy contract
    // artifact
    const EmpireBridgeVault = await ethers.getContractFactory(
      "EmpireBridgeVault"
    );
    const BridgeContract = await ethers.getContractFactory("Bridge");

    //deploy bridge
    bridge = await BridgeContract.deploy(
      bridge_validator.address,
      bridge_treasury.address
    );
    await bridge.deployed();

    //deploy bridge vault
    bridgeVault = await EmpireBridgeVault.deploy();
    await bridgeVault.deployed();
  });

  describe("Set Fee Function", function () {
    it("Only Owner can call this function", async function () {
      await expect(bridge.connect(client1).setFee(NEW_FEE)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should emit LogSetFee event", async function () {
      expect(await bridge.connect(deployer).setFee(NEW_FEE))
        .to.emit(bridge.address, "LogSetFee")
        .withArgs(NEW_FEE);
    });

    it("Function should correct change state", async function () {
      await bridge.connect(deployer).setFee(NEW_FEE);
      expect(await bridge.fee()).to.be.equal(NEW_FEE);
    });
  });

  describe("Set Maximal Amount Function", function () {
    it("Only Owner can call this function", async function () {
      await expect(
        bridge.connect(client1).setMaxAmount(NEW_MAX_AMOUNT)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("New Maximal Amount should be greater than or equal with Minimal Amount", async function () {
      await expect(bridge.connect(deployer).setMaxAmount(0)).to.be.revertedWith(
        "MaxAmount >= MinAmount"
      );
    });

    it("Should emit LogSetMaxAmount event", async function () {
      expect(await bridge.connect(deployer).setMaxAmount(NEW_MAX_AMOUNT))
        .to.emit(bridge.address, "LogSetMaxAmount")
        .withArgs(NEW_MAX_AMOUNT);
    });

    it("Function should correct change state", async function () {
      await bridge.connect(deployer).setMaxAmount(NEW_MAX_AMOUNT);
      expect(await bridge.maxAmount()).to.be.equal(NEW_MAX_AMOUNT);
    });
  });

  describe("Set Miniminal Amount Function", function () {
    it("Only Owner can call this function", async function () {
      await expect(
        bridge.connect(client1).setMinAmount(NEW_MAX_AMOUNT)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("New Miniminal Amount should be lower than or equal with Maximal Amount", async function () {
      await expect(
        bridge.connect(deployer).setMinAmount(NEW_MAX_AMOUNT * 2)
      ).to.be.revertedWith("MinAmount <= MaxAmount");
    });

    it("Should emit LogSetMinAmount event", async function () {
      expect(await bridge.connect(deployer).setMinAmount(NEW_MIN_AMOUNT))
        .to.emit(bridge.address, "LogSetMinAmount")
        .withArgs(NEW_MIN_AMOUNT);
    });

    it("Function should correct change state", async function () {
      await bridge.connect(deployer).setMinAmount(NEW_MIN_AMOUNT);
      expect(await bridge.minAmount()).to.be.equal(NEW_MIN_AMOUNT);
    });
  });

  describe("Set New Validator Address Function", function () {
    it("Only Owner can call this function", async function () {
      await expect(
        bridge.connect(client1).setValidator(new_bridge_validator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should emit LogSetValidator event", async function () {
      expect(
        await bridge
          .connect(deployer)
          .setValidator(new_bridge_validator.address)
      )
        .to.emit(bridge.address, "LogSetValidator")
        .withArgs(new_bridge_validator.address);
    });

    it("Function should correct change state", async function () {
      await bridge.connect(deployer).setValidator(new_bridge_validator.address);
      expect(await bridge.validator()).to.be.equal(
        new_bridge_validator.address
      );
    });
  });

  describe("Set New Treasury Address Function", function () {
    it("Only Owner can call this function", async function () {
      await expect(
        bridge.connect(client1).setTreasury(new_bridge_treasury.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should emit LogSetTreasury event", async function () {
      expect(
        await bridge.connect(deployer).setTreasury(new_bridge_treasury.address)
      )
        .to.emit(bridge.address, "LogSetTreasury")
        .withArgs(new_bridge_treasury.address);
    });

    it("Function should correct change state", async function () {
      await bridge.connect(deployer).setTreasury(new_bridge_treasury.address);
      expect(await bridge.TREASURY()).to.be.equal(new_bridge_treasury.address);
    });
  });

  describe("Set Token Pair List Function", function () {
    it("Only Owner can call this function", async function () {
      await expect(
        bridge
          .connect(client1)
          .updateBridgeTokenPairList(bnbAddress, 3, ethAddress)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should emit LogUpdateBridgeTokenPairList event", async function () {
      expect(
        await bridge
          .connect(deployer)
          .updateBridgeTokenPairList(bnbAddress, 3, ethAddress)
      )
        .to.emit(bridge.address, "LogUpdateBridgeTokenPairList")
        .withArgs(bnbAddress, 3, ethAddress);
    });

    it("Function should correct change state", async function () {
      await bridge
        .connect(deployer)
        .updateBridgeTokenPairList(bnbAddress, 3, ethAddress);
      expect(await bridge.bridgeTokenPair(bnbAddress, 3)).to.be.equal(
        ethAddress
      );
    });
  });

  describe("Interact with EMPIRE Token", function () {
    beforeEach(async function () {
      // deploy pancake factory first
      const PancakeFactory = await ethers.getContractFactory(
        "PancakeFactory",
        pancakeDeployer
      );
      pancakeFactoryContract = await PancakeFactory.deploy(
        pancakeFeeReceiver.address
      );
      await pancakeFactoryContract.deployed();

      // deploy WBNB factory first
      const WBNBContract = await ethers.getContractFactory(
        "WBNB",
        pancakeDeployer
      );
      wbnbContract = await WBNBContract.deploy();
      await wbnbContract.deployed();

      // deploy Pancake Router first
      const RouterContract = await ethers.getContractFactory(
        "PancakeRouter",
        pancakeDeployer
      );
      pancakeRouterContract = await RouterContract.deploy(
        pancakeFactoryContract.address,
        wbnbContract.address
      );
      await pancakeRouterContract.deployed();
      provider = ethers.provider;
      // const { chainId } = await provider.getNetwork();
      const Token = await ethers.getContractFactory("EmpireToken");
      // deploy empire
      token = await Token.deploy(
        pancakeRouterContract.address,
        marketingWallet.address,
        teamWallet.address,
        bridgeVault.address
      );
      await token.deployed();

      // let's assume we finish presale, so I enable trading on each test
      await token.setEnableTrading(true);
      await token.setBridge(bridge.address);

      // set reserve for unlock function
      await token.transfer(bridgeVault.address, INITIAL_VAULT_BALANCE);
      // airdrop for client
      await token.transfer(client1.address, AIRDROP_VALUE);
      await token.transfer(client2.address, AIRDROP_VALUE);
      await token.transfer(client3.address, AIRDROP_VALUE);
      await token.transfer(client4.address, AIRDROP_VALUE);
      await token.transfer(client5.address, AIRDROP_VALUE);

      // just test
      await bridge.updateBridgeTokenPairList(
        token.address,
        SWAP_CHAIN,
        ethAddress
      );
      // chainId 31337
    });

    describe("SWAP Function", function () {
      it("Swap will fail if its on paused state", async function () {
        await bridge.connect(deployer).setPause();
        await expect(
          bridge
            .connect(client1)
            .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN)
        ).to.be.reverted;
      });

      it("Swap will fail if amount below Minimum amount set by bridge", async function () {
        await expect(
          bridge
            .connect(client1)
            .swap(token.address, 10, client1.address, SWAP_CHAIN)
        ).to.be.reverted;
      });

      it("Swap will fail if amount greater than Maximum amount set by bridge", async function () {
        await expect(
          bridge
            .connect(client1)
            .swap(token.address, NEW_MAX_AMOUNT, client1.address, SWAP_CHAIN)
        ).to.be.reverted;
      });

      it("Swap will fail if token not supported by bridge", async function () {
        await expect(
          bridge
            .connect(client1)
            .swap(bnbAddress, SWAP_VALUE, client1.address, SWAP_CHAIN)
        ).to.be.reverted;
      });

      it("Swap will fail if fee not fulfilled", async function () {
        await expect(
          bridge
            .connect(client1)
            .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN, {
              value: WRONG_FEE,
            })
        ).to.be.reverted;
      });

      // no need approval now
      // it("Swap should need approval from token holder", async function () {
      //   await expect(
      //     bridge
      //       .connect(client1)
      //       .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN, {
      //         value: OLD_FEE,
      //       })
      //   ).to.be.reverted;
      // });

      it("Swap should emit LogSwap event", async function () {
        expect(
          await bridge
            .connect(client1)
            .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN, {
              value: OLD_FEE,
            })
        ).to.emit(bridge.address, "LogSwap");
      });

      it("Swap should transfer fee to treasury address", async function () {
        expect(
          await bridge.bridgeTokenPair(token.address, SWAP_CHAIN)
        ).to.equal(ethAddress);
        const old_treasury_balance = await provider.getBalance(
          bridge_treasury.address
        );
        await token.connect(client1).approve(bridge.address, MaxUint256);
        await bridge
          .connect(client1)
          .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN, {
            value: OLD_FEE,
          });
        const new_treasury_balance = await provider.getBalance(
          bridge_treasury.address
        );
        expect(new_treasury_balance).to.eq(old_treasury_balance.add(OLD_FEE));
      });

      it("Swap should emit LogLockByBridge on EMPIRE Contract", async function () {
        await token.connect(client1).approve(bridge.address, MaxUint256);
        expect(
          await bridge
            .connect(client1)
            .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN, {
              value: OLD_FEE,
            })
        ).to.emit(token.address, "LogLockByBridge");
      });

      it("Swap should transfer token from holder to BRIDGE VAULT", async function () {
        const old_vault_balance = await token.balanceOf(bridgeVault.address);
        const old_client1_balance = await token.balanceOf(client1.address);

        await token.connect(client1).approve(bridge.address, MaxUint256);
        await bridge
          .connect(client1)
          .swap(token.address, SWAP_VALUE, client1.address, SWAP_CHAIN, {
            value: OLD_FEE,
          });
        const new_vault_balance = await token.balanceOf(bridgeVault.address);
        const new_client1_balance = await token.balanceOf(client1.address);
        expect(new_vault_balance).to.eq(old_vault_balance.add(SWAP_VALUE));
        expect(new_client1_balance).to.eq(old_client1_balance.sub(SWAP_VALUE));
      });
    });

    describe("Redeem Function", function () {
      it("Only Validator can use this function", async function () {
        await expect(
          bridge
            .connect(client1)
            .redeem(
              TX_HASH,
              token.address,
              SWAP_VALUE,
              client1.address,
              SWAP_CHAIN
            )
        ).to.be.revertedWith("DENIED : Not Validator");
      });

      it("Redeem amount should be greater or equal than minimum amount bridge set", async function () {
        await expect(
          bridge
            .connect(bridge_validator)
            .redeem(TX_HASH, token.address, 1, client1.address, SWAP_CHAIN)
        ).to.be.reverted;
      });

      it("Redeem amount should be lower or equal than maximum amount bridge set", async function () {
        await expect(
          bridge
            .connect(bridge_validator)
            .redeem(
              TX_HASH,
              token.address,
              MaxUint256,
              client1.address,
              SWAP_CHAIN
            )
        ).to.be.reverted;
      });

      it("Redeem will fail if redeemed twice or more", async function () {
        await bridge
          .connect(bridge_validator)
          .redeem(
            TX_HASH,
            token.address,
            SWAP_VALUE,
            client1.address,
            SWAP_CHAIN
          );
        await expect(
          bridge
            .connect(bridge_validator)
            .redeem(
              TX_HASH,
              token.address,
              SWAP_VALUE,
              client1.address,
              SWAP_CHAIN
            )
        ).to.be.reverted;
      });

      it("Redeem should emit LogRedeem", async function () {
        expect(
          await bridge
            .connect(bridge_validator)
            .redeem(
              TX_HASH,
              token.address,
              SWAP_VALUE,
              client1.address,
              SWAP_CHAIN
            )
        ).to.emit(bridge.address, "LogRedeem");
      });

      it("Redeem should emit LogUnlockByBridge on EMPIRE Contract", async function () {
        expect(
          await bridge
            .connect(bridge_validator)
            .redeem(
              TX_HASH,
              token.address,
              SWAP_VALUE,
              client1.address,
              SWAP_CHAIN
            )
        ).to.emit(token.address, "LogUnlockByBridge");
      });

      it("Redeem should transfer balance from BRIDGE VAULT to holder address", async function () {
        const old_vault_balance = await token.balanceOf(bridgeVault.address);
        const old_client1_balance = await token.balanceOf(client1.address);
        await bridge
          .connect(bridge_validator)
          .redeem(
            TX_HASH,
            token.address,
            SWAP_VALUE,
            client1.address,
            SWAP_CHAIN
          );
        const new_vault_balance = await token.balanceOf(bridgeVault.address);
        const new_client1_balance = await token.balanceOf(client1.address);
        expect(new_vault_balance).to.eq(old_vault_balance.sub(SWAP_VALUE));
        expect(new_client1_balance).to.eq(old_client1_balance.add(SWAP_VALUE));
      });
    });
  });
});
