import Hodl from "../Hodl";
import MyLocks from "../MyLocks";
import SafetyGuidBanner from "../../Molecules/Banner/SafetyGuidBanner";
import { useState, useEffect, memo } from "react";
import { createClient } from "urql";
import { useSelector } from "react-redux";
const SafetyGuidBannerMemo = memo(SafetyGuidBanner);
const Lockups = () => {
  const currentAccount = useSelector(
    (state) => state.WalletDataReducer.currentAccount
  );
  const subgraphApiUrl = useSelector(
    (state) => state.ChainDataReducer.subgraphApiUrl
  );

  const [loading, setLoding] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchHodlData();
  }, [subgraphApiUrl, currentAccount]);

  const fetchHodlData = async () => {
    const account = '"' + currentAccount + '"';

    const depositQuery = `
      query {
      deposits(where:{owner:${account}} orderBy:lockedTime  orderDirection:desc){
      id
      unlockTime
      lockedTime
      owner
      amount
      withdrawn
      }
      }
      `;

    try {
      const client = createClient({
        url: subgraphApiUrl,
      });

      setLoding(true);
      const data = await client.query(depositQuery).toPromise();

      if (data.data.deposits) {
        setData(data.data.deposits);
      }
    } catch (e) {}

    setLoding(false);
  };
  return (
    <div className="px-5">
      <Hodl fetchHodlData={fetchHodlData} />
      <MyLocks data={data} loading={loading} fetchHodlData={fetchHodlData} />
      <SafetyGuidBannerMemo />
    </div>
  );
};

export default Lockups;
