export async function getCurrentChainId() {
  const chainId = await ethereum.request({ method: 'eth_chainId' });

  return parseInt(chainId, 16);
}
