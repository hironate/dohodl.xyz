const { CONTRACT_NAMES } = require('../utils/constants');
const { readContract, writeContract, writeABI } = require('../utils/io');

// deploy task
task(
  'deploy:erc20-hodl',
  'Deploy ERC20Hodl Contract',
  async (_, { ethers }) => {
    const accounts = await ethers.getSigners();
    const signer = accounts[0];
    const contractName = CONTRACT_NAMES.ERC20_HODL;

    const erc20Hodl = await ethers.deployContract(contractName, []);

    await erc20Hodl.waitForDeployment();

    console.info(`Contract deployed at ${erc20Hodl.target}`);

    writeContract(contractName, erc20Hodl.target, signer.address, []);
  },
);

// verify task
task('verify:erc20-hodl', 'Verify ERC20Hodl Contract', async (_, { run }) => {
  const erc20Hodl = readContract(CONTRACT_NAMES.ERC20_HODL);

  await run('verify:verify', {
    address: erc20Hodl.address,
    constructorArguments: [],
  });
});

// export abi task
task('abi:erc20-hodl', 'Export ERC20Hodl contract ABI', async () => {
  writeABI('ERC20Hodl.sol/ERC20Hodl.json', CONTRACT_NAMES.ERC20_HODL);
});
