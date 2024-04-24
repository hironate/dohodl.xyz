const initialState = {
  name: 'Ethereum Mainnet',
  chain: 'ETH',
  chainId: 1,
  nativeCurrencySymbol: 'ETH',
  rpc: [
    `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  ],
  logoUrl: '/images/chainLogo/ethereum.png',
  subgraphApiUrl: '',
  vesterSubgraphApiUrl: '',
  etherscan: '',
};

export const ChainDataReducer = (state = initialState, { payload, type }) => {
  switch (type) {
    case 'SetChainData':
      state = {
        ...payload,
      };

      return state;
    default:
      return state;
  }
};
