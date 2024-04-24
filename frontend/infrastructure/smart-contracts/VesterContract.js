import { getContract } from '../../utils/web3/index';
import { vestingContractAddress } from '../../constant'
import VesterAbi from '../../artifacts/contracts/abis/Vester.json';

const contract = getContract(vestingContractAddress, VesterAbi.abi);

export const createVestingSchedule = async (reciever, tokenAddress, amount, startDate, cliff, duration, slicePeriod, revocable) => {
    const tx = await contract.createVesting(reciever, tokenAddress, amount, startDate, cliff, duration, slicePeriod, revocable);
    return tx;
}

export const withdrawTokens = async (vestingId, amount) => {
    const tx = await contract.withdraw(vestingId, amount);
    return tx;
}

export const revokeVesting = async (vestingId, reciever) => {
    const tx = await contract.revoke(vestingId, reciever);
    return tx;
}

export const depositorsVesting = async (account) => {
    const tx = await contract.getDepositorsVesting(account);
    return tx;
}

export const receiversVesting = async (account) => {
    const tx = await contract.getReceiversVesting(account);
    return tx;
}

export const getVestingSchedulesData = async (vestingId, reciever) => {
    const tx = await contract.getVestingSchedules(vestingId, reciever);
    return tx;
}
