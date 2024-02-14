const hre = require("hardhat");

async function main() {
  const Hodl = await hre.ethers.getContractFactory("Hodl");
  const hodl = await Hodl.deploy();

  const receipt = await hodl.deployed();

  console.log("Hodl deployed to:", hodl.address); //0xf579CeCCDddDfBA0B0c3DABB88AE5Fa44035b4ae
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
