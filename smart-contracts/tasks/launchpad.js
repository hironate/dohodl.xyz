const { CONTRACT_NAMES } = require('../utils/constants');
const { readContract, writeContract, writeABI } = require('../utils/io');

// deploy task
task('deploy:launchpad', 'Deploy Launchpad Contract', async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const contractName = CONTRACT_NAMES.LAUNCHPAD;

  // only for testnet
  const launchpad = await ethers.deployContract(contractName, [
    '0x0227628f3f023bb0b980b67d528571c95c6dac1c', // Uniswap factory contract
    '0x1238536071e1c677a632429e3655c799b22cda52', // Uniswap nft position-manager contract
    '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', // WETH contract
  ]);

  await launchpad.waitForDeployment();

  console.info(`Contract deployed at ${launchpad.target}`);

  writeContract(contractName, launchpad.target, signer.address, []);
});

// verify task
task('verify:launchpad', 'Verify Launchpad Contract', async (_, { run }) => {
  const launchpad = readContract(CONTRACT_NAMES.LAUNCHPAD);

  await run('verify:verify', {
    address: launchpad.address,
    // only for testnet
    constructorArguments: [
      '0x0227628f3f023bb0b980b67d528571c95c6dac1c',
      '0x1238536071e1c677a632429e3655c799b22cda52',
      '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    ],
  });
});

// export abi task
task('abi:launchpad', 'Export Launchpad contract ABI', async () => {
  writeABI('Launchpad.sol/Launchpad.json', CONTRACT_NAMES.LAUNCHPAD);
});
