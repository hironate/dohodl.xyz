import { combineReducers } from 'redux';
import { ChainDataReducer } from './ChainDataReducer';
import { WalletDataReducer } from './WalletDataReducer';

const reducers = combineReducers({
  ChainDataReducer,
  WalletDataReducer,
});

export default reducers;
