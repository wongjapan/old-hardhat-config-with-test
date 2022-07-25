# NEW Empire Token

## BSC Testnet Deployment

Bridge Vault deployed to: https://testnet.bscscan.com/address/0xA335b8faDa1882AceC43Ab309A393958DB876A46#code

EmpireToken deployed to: https://testnet.bscscan.com/address/0xa153c52c01Bd386ab1bC3A9186Db3d439C741C7a#code

Bridge deployed to: https://testnet.bscscan.com/address/0x6D8153eDb7fa36eF4E2C992EB353c9d01cc1B18C#code


# Clone Repo and Install dependencies

1. git clone https://github.com/Rob-Labs/Empire-Token.git
2. npm i
3. cp .env.example .env
4. Put credentials in .env


# Run tests
1. npx hardhat test


# Deploye Empire and verify Token on BSC Testnet
1. npx hardhat run scripts/deploy.js --network bscTestnet


# Deploye Bridge and verify on BSC Testnet
1. npx hardhat run scripts/deployBridge.js --network bscTestnet



## Test Result

### EMPIRE TOKEN TEST RESULT

Empire Token Deployment Test
    ✔ Has a correct name 'EmpireToken'
    ✔ Has a correct symbol 'EMPIRE' (359ms)
    ✔ Has 9 decimals (398ms)
    ✔ Has 1 billion tokens with 9 decimal units (10^18)
    ✔ Correct Marketing address wallet
    ✔ Correct Team address wallet (404ms)
    ✔ Correct Liquidity address wallet set to Deployer Address
    ✔ Correct Dead (burn) address wallet
    ✔ Trading is disabled by default (394ms)
    ✔ All Empire Token supply send to deployer address

  Empire Token Write Function Test
    Public Write Methods
      Approval Function
        ✔ Should emit Approval events
        ✔ Spender Can't be ZERO Address (0x)
      Increase Allowance Function
        ✔ Should emit Approval events
        ✔ Spender Can't be ZERO Address (0x)
      Decrease Allowance Function
        ✔ Should emit Approval events
        ✔ Allowance MUST not below 0 (zero)
      Deliver Function
        ✔ Should emit LogDeliver events
        ✔ Deliver function can't be call by excluded from reward address (961ms)
    Only Owner Write Methods
      excludeFromReward Function
        ✔ Only deployer can use this function
        ✔ Should emit LogExcludeFromReward event
        ✔ Function should correct change state (1362ms)
      includeInReward Function
        ✔ Only deployer can use this function
        ✔ Should Reverted if already include in reward
        ✔ Should emit LogIncludeInReward event (1044ms)
        ✔ Function should correct change state (1814ms)
      setAutomatedMarketMakerPair Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetAutomatedMarketMakerPair event
        1) Function should correct change state
      setBridge Function
        ✔ Only deployer can use this function
        ✔ Should Reverted if bridge address is same with current bridge address (2636ms)
        ✔ Should emit LogSetBridge event
      setBurnWallet Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetBridge event
      setBuyFees Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetBuyFees event
      setSellFees Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetSellFees event
      setEnableTrading Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetEnableTrading event
      setExcludeFromFee Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetExcludeFromFee event
      setMarketingWallet Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetMarketingWallet event
      setTeamWallet Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetTeamWallet event
      setRouterAddress Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetRouterAddress event
      setSwapAndLiquifyEnabled Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSwapAndLiquifyEnabledUpdated event
      setSwapTokensAmount Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetSwapTokensAmount event

  Empire Token Interaction with bridge
    Check Lock and Unlock from Bridge
      2) "before each" hook for "Correct balance change after lock"

  Empire Token Transfer Test
    Transfer at Presale Time
      ✔ Transfer when Presale Time require sender and receiver is excluded from fee (8375ms)
    Transfer after Presale Time
      Transfers tokens between accounts
        ✔ Transfer fails when sender doesn't have enough tokens (2038ms)
        ✔ Correct updates balances after transfers (16672ms)
    Liquidity, Trade and Reflection Test
      Liquidity Test
        ✔ Should be able to add liquidity (28848ms)


### BRIDGE CONTRACT TEST RESULT

Bridge Contract Test Case
    Set Fee Function
      ✔ Only Owner can call this function
      ✔ Should emit LogSetFee event
      ✔ Function should correct change state
    Set Maximal Amount Function
      ✔ Only Owner can call this function
      ✔ New Maximal Amount should be greater than or equal with Minimal Amount
      ✔ Should emit LogSetMaxAmount event
      ✔ Function should correct change state
    Set Miniminal Amount Function
      ✔ Only Owner can call this function
      ✔ New Miniminal Amount should be lower than or equal with Maximal Amount
      ✔ Should emit LogSetMinAmount event
      ✔ Function should correct change state
    Set New Validator Address Function
      ✔ Only Owner can call this function
      ✔ Should emit LogSetValidator event
      ✔ Function should correct change state
    Set New Treasury Address Function
      ✔ Only Owner can call this function
      ✔ Should emit LogSetTreasury event
      ✔ Function should correct change state
    Set Token Pair List Function
      ✔ Only Owner can call this function
      ✔ Should emit LogUpdateBridgeTokenPairList event
      ✔ Function should correct change state (38ms)
    Interact with EMPIRE Token
      SWAP Function
        ✔ Swap will fail if its on paused state
        ✔ Swap will fail if amount below Minimum amount set by bridge
        ✔ Swap will fail if amount greater than Maximum amount set by bridge
        ✔ Swap will fail if token not supported by bridge
        ✔ Swap will fail if fee not fulfilled
        ✔ Swap should need approval from token holder
        ✔ Swap should emit LogSwap event
        ✔ Swap should transfer fee to treasury address (72ms)
        ✔ Swap should emit LogLockByBridge on EMPIRE Contract (57ms)
        ✔ Swap should transfer token from holder to BRIDGE VAULT (76ms)
      Redeem Function
        ✔ Only Validator can use this function
        ✔ Redeem amount should be greater or equal than minimum amount bridge set
        ✔ Redeem amount should be lower or equal than maximum amount bridge set
        ✔ Redeem will fail if redeemed twice or more
        ✔ Redeem should emit LogRedeem
        ✔ Redeem should emit LogUnlockByBridge on EMPIRE Contract
        ✔ Redeem should transfer balance from BRIDGE VAULT to holder address (47ms)







