const { CONTRACT_NAMES } = require('../utils/constants');
const { readContract, writeContract, writeABI } = require('../utils/io');

// deploy task
task('deploy:launchpad', 'Deploy Launchpad Contract', async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const contractName = CONTRACT_NAMES.LAUNCHPAD;

  const launchpad = await ethers.deployContract(contractName, []);

  await launchpad.waitForDeployment();

  console.info(`Contract deployed at ${launchpad.target}`);

  writeContract(contractName, launchpad.target, signer.address, []);
});

// verify task
task('verify:launchpad', 'Verify Launchpad Contract', async (_, { run }) => {
  const launchpad = readContract(CONTRACT_NAMES.LAUNCHPAD);

  await run('verify:verify', {
    address: launchpad.address,
    constructorArguments: [],
  });
});

// export abi task
task('abi:launchpad', 'Export Launchpad contract ABI', async () => {
  writeABI('Launchpad.sol/Launchpad.json', CONTRACT_NAMES.LAUNCHPAD);
});
