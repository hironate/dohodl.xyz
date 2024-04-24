import { Image } from "../../Atom/Image";
export default function TokenDetails({ data, chainData }) {
  return (
    <div className="divide-y text-lg my-2 border-gray-200 border-2 rounded-lg ">
      <div className="flex justify-between w-full p-3">
        <span className="text-gray-500"> Symbol </span>
        <div className="inline-flex gap-x-1.5">
          <span>{data.symbol}</span>
          <div className="flex content-center">
            <Image
              src={chainData.logoUrl}
              alt={"$"}
              className={"w-6"}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between p-3">
        <span className="text-gray-500">Balance </span>
        <span>{data.balance}</span>
      </div>
      <div className="flex justify-between p-3">
        <span className="text-gray-500">Decimals </span>
        <div>{data.decimal}</div>
      </div>
    </div>
  );
}
