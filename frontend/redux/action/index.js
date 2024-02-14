export const setChainData = (data) => {
  return {
    type: 'SetChainData',
    payload: data,
  };
};

export const setWalletData = (data) => {
  return {
    type: 'SetWalletData',
    payload: data,
  };
};
