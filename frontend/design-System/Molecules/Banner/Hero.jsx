import Heading, { Description, SubHeading } from '../../Atom/Headings';
import { Button } from '../../Atom/Button';
const Hero = () => {
  return (
    <div className="container hero background-image p-3 lg:py-20 mx-auto text-white shadow-lg text-center ">
      <div className="flex justify-center text-3xl md:text-6xl">
        <Heading className="inline  font-bold ml-1 mt-auto">
          Stay Away From Emotional Trading
        </Heading>
      </div>
      <div className="mx-auto bg-indigo-300 h-0.5 md:mt-4 w-20 sm:w-48">
        <span></span>
      </div>
      <div className="text-xl md:text-3xl mt-5 font-semibold">
        <SubHeading>
          HODL Your Assets, Prevent your self from trading it.
        </SubHeading>
        <Description className="text-base md:text-lg mt-2">
          Crypto is a long term game. Lock Your Assets for Day, Months and
          Years.
        </Description>
        <Description className="text-base md:text-lg mt-2">
          No Impermenant Loss, No Trading Loss.
        </Description>
      </div>
      <div className="mt-8">
        <Button
          customClassName="bg-white text-indigo-500 font-bold px-10 md:px-28 py-2 rounded-lg"
          link={'/hodl'}
        >
          Lock Native Assets
        </Button>
      </div>
    </div>
  );
};

export default Hero;
