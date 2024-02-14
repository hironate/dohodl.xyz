const initialState = {
  currentAccount: '',
  accountBalance: '',
  isConnected: false,
};

export const WalletDataReducer = (state = initialState, { payload, type }) => {
  switch (type) {
    case 'SetWalletData':
      state = {
        ...state,
        ...payload,
      };

      return state;
    default:
      return state;
  }
};
