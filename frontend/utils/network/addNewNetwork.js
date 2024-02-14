export async function addNewNetwork({ chainId, name, rpc }) {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${Number(chainId).toString(16)}`,
          chainName: name,
          rpcUrls: rpc,
        },
      ],
    });
  } catch (addError) {
    console.log('error : failed to add new network on Metamask ');
  }
}
