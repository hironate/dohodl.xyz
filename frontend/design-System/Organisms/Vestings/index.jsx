import Vester from "../Vester";
import { Label } from "../../Atom/Label";
import DepositorsVesting from "../../Molecules/DepositorsVestings";
import ReceiversVesting from "../../Molecules/ReceiversVestings";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getDecimals, getSymbol } from "../../../infrastructure/smart-contracts/ERC20Contract";
import { createClient } from 'urql';
import { depositorsQuery, receiversQueryByAddress, receiversQueryById } from '../../../utils/queries/subgraphQuery'
const Vestings = () => {
  const walletData = useSelector((state) => state.WalletDataReducer);
  const currentAccount = walletData.currentAccount;
  const dispatch = useDispatch();
  const chainData = useSelector(
    (state) => state.ChainDataReducer,
  );
  const vesterSubgraphApiUrl = chainData.vesterSubgraphApiUrl;
  const [loading, setLoading] = useState(false);
  const [receiverLoading, setReceiverLoading] = useState(false);
  const [deposites, setDeposites] = useState([]);
  const [receives, setReceives] = useState([]);

  const fetchReceiversVestings = async () => {
    try {
      const client = createClient({
        url: vesterSubgraphApiUrl,
      })
      setReceiverLoading(true);
      const data = (await client.query(receiversQueryByAddress(currentAccount)).toPromise()).data.receivers;
      if (data) {
        for (let i = 0; i < data.length; i++) {
          data[i].vestingId.symbol = await getSymbol(data[i].vestingId.token);
          data[i].vestingId.decimal = await getDecimals(data[i].vestingId.token)
        }
        setReceives(data);
      }
    } catch (error) {
    }
    setReceiverLoading(false);
  };
  const fetchDepositorsVestings = async () => {
    console.log(vesterSubgraphApiUrl);
    try {
      let receiversData = [];
      const client = createClient({
        url: vesterSubgraphApiUrl,
      })
      setLoading(true);
      const data = (await client.query(depositorsQuery(currentAccount)).toPromise()).data.vestingSchedules;
      if (data) {
        for (let i = 0; i < data.length; i++) {
          const vestingId = data[i].vestingId;
          receiversData = await client.query(receiversQueryById(vestingId)).toPromise();
          data[i].receivers = receiversData.data.receivers;
          data[i].symbol = await getSymbol(data[i].token);
          data[i].decimal = await getDecimals(data[i].token);
        }
        setDeposites(data);
      }
    } catch (error) {
    }
    setLoading(false);
  };

  useEffect(() => {
    setDeposites([]);
    setReceives([]);
    fetchDepositorsVestings();
    fetchReceiversVestings();
  }, [currentAccount, vesterSubgraphApiUrl]);

  const refreshData = async () => {
    const provider = walletData.provider;
    let balance = await provider.getBalance(walletData.currentAccount);
    balance = ethers.utils.formatEther(balance);
    const data = {
      accountBalance: balance,
    };
    dispatch(setWalletData(data));
  };
  return (
    <div className="px-5">
      <Vester fetchDepositorsVestings={fetchDepositorsVestings} />
      <div className="mt-10 ">
        <Label className="text-center py-2 text-3xl font-bold  mb-0.5">
          My Vestings
        </Label>
        <DepositorsVesting deposites={deposites} loading={loading} />
        <ReceiversVesting receives={receives} loading={receiverLoading} fetchReceiversVestings={fetchReceiversVestings} refreshData={refreshData} />
      </div>
    </div>
  );
};
export default Vestings;
