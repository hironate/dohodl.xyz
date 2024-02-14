import Heading from '../Headings';

export const InfoCard = ({ label, amount, currency }) => {
  return (
    <div className=" background-image  text-white rounded-lg   py-10  w-96 my-2  gap-y-5">
      <div className="flex justify-center space-x-1">
        <Heading className="text-center font-bold text-3xl">{amount}</Heading>
        <Heading className="text-center font-bold text-3xl">{currency}</Heading>
      </div>

      <h3 className="text-center text-white text-2xl font-semibold mt-2">
        {label}
      </h3>
    </div>
  );
};
