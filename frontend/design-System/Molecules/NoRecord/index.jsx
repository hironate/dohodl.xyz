import { Image } from '../../Atom/Image';
const NoRecord = ({ textData }) => {
  let data = [textData ? textData[0] : 'No Locked Tokens', textData ? textData[1] : 'You have not locked up any tokens yet.']
  return (
    <div className=" bg-white p-5 rounded-3xl">
      <div className="flex justify-center items-center">
        <Image src={'/images/emptyData.png'} className="h-40" alt="Empty" />
      </div>
      <h1 className="text-center text-2xl text-gray-700">{data[0]}</h1>
      <h3 className="text-center text-gray-500">
        {data[1]}
      </h3>
    </div>
  );
};

export default NoRecord;
