import { getContract } from "../../utils/web3/index"
import TokenAbi from '../../artifacts/contracts/abis/Token.json'

export const getBalance = async (tokenAddress, account) => {
    const contract = getContract(tokenAddress, TokenAbi);
    return await contract.balanceOf(account);
}

export const getSymbol = async (tokenAddress) => {
    const contract = getContract(tokenAddress, TokenAbi);
    return await contract.symbol();
}

export const getDecimals = async (tokenAddress) => {
    const contract = getContract(tokenAddress, TokenAbi);
    return await contract.decimals();
}

export const approveToken = async (tokenAddress, spender, amount) => {
    const contract = getContract(tokenAddress, TokenAbi);
    return await contract.approve(spender, amount);

}   