import Image from "next/image";
import React from "react";

type chainName = "ethereum" | "base" | "polygon" | "binance" | string;

const ChainLogo = ({
  chainName = "ethereum",
  width = 25,
  height = 20,
}: {
  chainName?: chainName;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      alt="chain"
      src={`/images/chainlogo/${chainName === "bsc" ? "binance" : chainName}.png`}
      width={width}
      height={height}
    />
  );
};

export default ChainLogo;
