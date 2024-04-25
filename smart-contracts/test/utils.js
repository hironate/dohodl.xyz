const deployContract = async (contractName, args) => {
  const contract = await ethers.deployContract(contractName, ...([args] || []));
  await contract.waitForDeployment();

  return contract;
};

const sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};

module.exports = { deployContract, sleep };
