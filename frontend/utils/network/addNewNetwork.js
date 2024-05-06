export async function addNewNetwork({
  chainId,
  name,
  rpc,
  logoUrl,
  nativeCurrencySymbol,
  etherscan,
}) {
  try {
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${Number(chainId).toString(16)}`,
          chainName: name,
          rpcUrls: rpc,
          iconUrls: [logoUrl],
          nativeCurrency: {
            symbol: nativeCurrencySymbol,
            decimals: 18,
          },
          blockExplorerUrls: [etherscan],
        },
      ],
    });
  } catch (addError) {
    console.log("error : failed to add new network on Metamask ");
  }
}
