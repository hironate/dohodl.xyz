import { Image } from "../../Atom/Image";
const VestingHeaderData = (props) => {
  return (
    <div className=" bg-white p-5 rounded-3xl">
      <div className="flex justify-center items-center">
        <Image src={"/images/vestingLogo.png"} className="h-20" alt="Empty" />
      </div>
      <h3 className="text-center text-gray-500">{props.textData}</h3>
    </div>
  );
};

export default VestingHeaderData;
