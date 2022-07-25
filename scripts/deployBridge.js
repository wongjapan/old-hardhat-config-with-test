// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const _validator = "0x6a091301bCF7Baa9d18ebB5FF651D75f075Fa53f";
  const _treasury = "0x6a091301bCF7Baa9d18ebB5FF651D75f075Fa53f";

  const Bridge = await ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(_validator, _treasury);
  await bridge.deployed();
  console.log("Bridge deployed to:", bridge.address);

  try {
    await hre.run('verify', {
      address: bridge.address,
      constructorArgsParams: [
        _validator, 
        _treasury
      ],
    })
  } catch (error) {
    console.error(error)
    console.log(`Smart contract at address ${bridge.address} is already verified`)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
