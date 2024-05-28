"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
} from "recharts";
import { getChartDataByCoinId } from "@/helper/coingecko-helper";
import moment from "moment/moment";

type NativeinUSDTLineChartType = {
  nativeId: string | any;
  days: string | any;
  interval: "5m" | "hourly" | "daily" | any;
  className: string | any;
};

const NativeinUSDTLineChart = ({
  nativeId = "",
  days = "",
  interval = "daily",
  className = "",
}: NativeinUSDTLineChartType) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await getChartDataByCoinId({
        id: nativeId,
        days,
        interval,
      });

      const customData = data?.["prices"]?.map((item: any) => {
        const [timeStamp, priceInUSD] = item;
        return {
          date:
            Number(days) > 7
              ? moment(timeStamp).format("MMM D")
              : moment(timeStamp).format("ddd"),
          price: priceInUSD,
        };
      });

      setChartData(customData);
    };

    getData();
  }, [nativeId, days, interval]);

  return (
    <div className={`h-fit w-fit ${className}`}>
      <LineChart width={500} height={200} data={chartData}>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, dy: 10 }}
          // domain={['auto', 'auto']}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
          tick={{ dx: -20, fontSize: 12 }}
        />
        <CartesianGrid vertical={false} strokeDasharray="5 5" color="green" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#B026FF"
          strokeWidth="3px"
          strokeOpacity={20}
        />
      </LineChart>
    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { value, payload: data } = payload[0];
    return (
      <div className="custom-tooltip bg-dashboard-color border-default flex  w-full flex-col items-start gap-2 rounded-lg border p-3 text-center drop-shadow-2xl">
        <div className="text-sm">{data?.date}</div>
        <div className="text-neon-purple text-lg font-semibold ">
          ${parseFloat(value).toFixed(0)}
        </div>
      </div>
    );
  }

  return null;
};

export default NativeinUSDTLineChart;
