import { useState, useEffect, memo } from "react";
import { ethers } from "ethers";
import { createClient } from "urql";
import { InfoCard } from "../../Atom/InfoCard";
import { useSelector } from "react-redux";
const InfoCardMemo = memo(InfoCard);

const InfoCards = () => {
  const chainData = useSelector((state) => state).ChainDataReducer;

  const [data, setData] = useState({
    totalLocks: "00",
    lockedAmount: "00",
    withdrawn: "00",
  });

  useEffect(() => {
    fetchAllLocks();
  }, [chainData.subgraphApiUrl]);

  const fetchAllLocks = async () => {
    const query = `
    query {
    deposits(where:{tokenAddress:null}){    
    id
    amount
    withdrawn
    }
    }
    `;

    try {
      const client = createClient({
        url: chainData.subgraphApiUrl,
      });

      const allLocks = await client.query(query).toPromise();
      if (allLocks.data.deposits) {
        data = allLocks.data.deposits;
      }
    } catch (e) {}

    let totalLocks = 0;
    let lockedAmount = 0;
    let withdrawn = 0;

    for (let i = 0; i < data.length; i++) {
      let amount = parseInt(data[i].amount);

      totalLocks += amount;
      if (data[i].withdrawn) {
        withdrawn += amount;
      } else {
        lockedAmount += amount;
      }
    }
    totalLocks = weiToEthFormate(totalLocks);
    lockedAmount = weiToEthFormate(lockedAmount);
    withdrawn = weiToEthFormate(withdrawn);

    setData({
      totalLocks,
      lockedAmount,
      withdrawn,
    });
  };

  function weiToEthFormate(wei) {
    let eth = ethers.utils.formatEther("" + wei);
    return parseFloat(Number(eth)).toFixed(3);
  }

  let infoData = [
    {
      amount: data.totalLocks,
      title: "Total Lock Value",
    },
    {
      amount: data.lockedAmount,
      title: " Locked Value",
    },
    {
      amount: data.withdrawn,
      title: "Withdrawn",
    },
  ];

  return (
    <div className="container flex flex-wrap justify-center mx-auto mt-5 md:space-x-5">
      {infoData.map((data, index) => {
        return (
          <InfoCardMemo
            amount={data.amount}
            label={data.title}
            currency={chainData.nativeCurrencySymbol}
            key={index}
          />
        );
      })}
    </div>
  );
};

export default InfoCards;
