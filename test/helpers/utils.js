const { ethers } = require("hardhat");

const utils = ethers.utils;
const parseUnits = utils.parseUnits;
const formatUnits = utils.formatUnits;
const MaxUint256 = ethers.constants.MaxUint256;

// 1 billion, with 9 decimal
// or we can write formatUnits("1", 18)
const EMPIRE_TOTAL_SUPPLY = parseUnits("1000000000", 9); // 1B EMPIRE
const AIRDROP_VALUE = parseUnits("100000", 9); // 100K EMPIRE
const SWAP_VALUE = parseUnits("1000", 9); // 1K EMPIRE
const INITIAL_EMPIRE_LIQUIDITY = parseUnits("500000000", 9); // 500M EMPIRE
const INITIAL_BNB_LIQUIDITY = parseUnits("500", 18); // 500 BNB
const DEFAULT_EMPIRE_TRANSFER = parseUnits("500", 9); // 500 EMPIRE

module.exports = {
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
};
