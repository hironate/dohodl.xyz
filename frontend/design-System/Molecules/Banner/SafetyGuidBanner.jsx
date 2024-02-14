import React from 'react';
import Heading, { Description } from '../../Atom/Headings';
import { Button } from '../../Atom/Button';
const SafetyGuidBanner = () => {
  return (
    <div className="container background-image text-center lg:text-left flex flex-wrap md:rounded-full mx-auto p-3 md:py-10 md:px-16 mt-10 gap-5">
      <div className="grow flex  flex-col gap-3">
        <Heading className="text-white text-2xl md:text-3xl ">
          Safe and Secure Asset Locking
        </Heading>
        <Description className="text-indigo-100   md:text-xl ">
          Free, Simple, Safe and Secure.
        </Description>
      </div>
      <div className="flex items-center mx-auto justify-center md:justify-end gap-x-5">
        <Button customClassName="bg-white py-2 px-3 text-indigo-800  rounded-2xl">
          Lock Assets
        </Button>
        <Button customClassName="text-white py-2 px-3  bg-white rounded-2xl bg-transparent border-2 border-white">
          Why Locking ?
        </Button>
      </div>
    </div>
  );
};

export default SafetyGuidBanner;
