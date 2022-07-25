# How To Running Local Test EMPIRE Token

1. Clone Repo and Install dependencies

   First clone this repository to local computer

   ```sh
   git clone https://github.com/Rob-Labs/Empire-Token.git
   ```

   Install dependency

   ```sh
   # if using NPM
   npm i

   #if yusing yarn
   yarn
   ```

2. Make sure we set **INIT_CODE_PAIR_HASH** on PancakeLibrary first

   ```sh
   # run this command to get INIT_CODE_PAIR_HASH
   npx hardhat test test/001_pancake.js
   ```

   you will see result like this

   ```
   Pancake Factory Deploy
   Please Change init pair hash on `PancakeLibrary.sol` at line 38 to 0xcddf3c2fd2627b5bd4be13837d39b94819fe2ee301c7cf30c59531cc4278339c without `0x` before run complete test
       ✔ Get INIT_CODE_PAIR_HASH (67ms)
   ```

   check **PancakeLibrary.sol** file at `contracts/uniswap/libraries/PancakeLibrary.sol`, then change ` hex"cddf3c2fd2627b5bd4be13837d39b94819fe2ee301c7cf30c59531cc4278339c" // init code hash` with result from test, without `0x`

3. Running test

   ```sh
   # Command to run all test
   npx hardhat test
   ```

4. Test Result

   You will find there's 1 (one) test fail `Swap should need approval from token holder` because now to lock empire we doesn't need approval from holder

## All Test Result

Pancake Factory Deploy

Please Change init par hash on `PancakeLibrary.sol` at line 38 to 0xcddf3c2fd2627b5bd4be13837d39b94819fe2ee301c7cf30c59531cc4278339c without `0x` before run complete test

    ✔ Get INIT_CODE_PAIR_HASH (67ms)

Bridge Contract Test Case

    Set Fee Function
      ✔ Only Owner can call this function (48ms)
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
      ✔ Function should correct change state
    Interact with EMPIRE Token
      SWAP Function
        ✔ Swap will fail if its on paused state
        ✔ Swap will fail if amount below Minimum amount set by bridge
        ✔ Swap will fail if amount greater than Maximum amount set by bridge
        ✔ Swap will fail if token not supported by bridge
        ✔ Swap will fail if fee not fulfilled
        ✔ Swap should emit LogSwap event
        ✔ Swap should transfer fee to treasury address (39ms)
        ✔ Swap should emit LogLockByBridge on EMPIRE Contract
        ✔ Swap should transfer token from holder to BRIDGE VAULT (46ms)
      Redeem Function
        ✔ Only Validator can use this function
        ✔ Redeem amount should be greater or equal than minimum amount bridge set
        ✔ Redeem amount should be lower or equal than maximum amount bridge set
        ✔ Redeem will fail if redeemed twice or more
        ✔ Redeem should emit LogRedeem
        ✔ Redeem should emit LogUnlockByBridge on EMPIRE Contract
        ✔ Redeem should transfer balance from BRIDGE VAULT to holder address

Empire Token Deployment Test

    ✔ Has a correct name 'EmpireToken'
    ✔ Has a correct symbol 'EMPIRE'
    ✔ Has 9 decimals
    ✔ Has 1 billion tokens with 9 decimal units (10^18)
    ✔ Correct Marketing address wallet
    ✔ Correct Team address wallet
    ✔ Correct Liquidity address wallet set to Deployer Address
    ✔ Correct Dead (burn) address wallet
    ✔ Trading is disabled by default
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
        ✔ Deliver function can't be call by excluded from reward address
    Only Owner Write Methods
      excludeFromReward Function
        ✔ Only deployer can use this function
        ✔ Should emit LogExcludeFromReward event
        ✔ Function should correct change state
      includeInReward Function
        ✔ Only deployer can use this function
        ✔ Should Reverted if already include in reward
        ✔ Should emit LogIncludeInReward event
        ✔ Function should correct change state
      setAutomatedMarketMakerPair Function
        ✔ Only deployer can use this function
        ✔ Should emit LogSetAutomatedMarketMakerPair event
        ✔ Function should correct change state
      setBridge Function
        ✔ Only deployer can use this function
        ✔ Should Reverted if bridge address is same with current bridge address
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
      ✔ Correct balance change after lock (57ms)
      ✔ Correct balance change after unlock (41ms)

Empire Token Transfer Test

    Transfer at Presale Time
      ✔ Transfer when Presale Time require sender OR receiver is excluded from fee
    Transfer after Presale Time
      Transfers tokens between accounts
        ✔ Transfer fails when sender doesn't have enough tokens
        ✔ Correct updates balances after transfers (51ms)
    Liquidity Test
      ✔ Should be able to add liquidity (86ms)
      ✔ Should be able to remove liquidity (138ms)
    Trading (Buy /Sell) Test
      ✔ User should be able to buy and sell EMPIRE on AMM (309ms)
      ✔ Should be take fee when buy/sell EMPIRE from Include in Fee address (280ms)
      ✔ Should not be take fee when buy/sell EMPIRE from Exclude in Fee address (134ms)
        Print Unit A and B
        Unit A : 97818.048536108
        Unit B : 97818.048536108
      ✔ Should be take correct fee when buy Empire and Reflect Fee to Holder (124ms)

99 passing (2m)
