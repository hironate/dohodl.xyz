const { CONTRACT_NAMES } = require('../utils/constants');
const { readContract, writeContract, writeABI } = require('../utils/io');

// deploy task
task('deploy:hodl', 'Deploy Hodl Contract', async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const contractName = CONTRACT_NAMES.HODL;

  const hodl = await ethers.deployContract(contractName, []);

  await hodl.waitForDeployment();

  console.info(`Contract deployed at ${hodl.target}`);

  writeContract(contractName, hodl.target, signer.address, []);
});

// verify task
task('verify:hodl', 'Verify Hodl Contract', async (_, { run }) => {
  const hodl = readContract(CONTRACT_NAMES.HODL);

  await run('verify:verify', {
    address: hodl.address,
    constructorArguments: [],
  });
});

// export abi task
task('abi:hodl', 'Export Hodl contract ABI', async () => {
  writeABI('Hodl.sol/Hodl.json', CONTRACT_NAMES.HODL);
});
