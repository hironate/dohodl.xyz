import { Image } from '../../Atom/Image';
const NoRecord = () => {
  return (
    <div className=" bg-white p-5 rounded-3xl">
      <div className="flex justify-center items-center">
        <Image src={'/images/emptyData.png'} className="h-40" alt="Empty" />
      </div>
      <h1 className="text-center text-2xl text-gray-700">No Locked Tokens</h1>
      <h3 className="text-center text-gray-500">
        You have not locked up any tokens yet.
      </h3>
    </div>
  );
};

export default NoRecord;
