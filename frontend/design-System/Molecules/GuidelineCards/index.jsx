import React from 'react';
import Heading, { Description } from '../../Atom/Headings';
import { Image } from '../../Atom/Image';
import { Button } from '../../Atom/Button';
import data from '../../../config/guidelineCard';
const GuidelineCards = () => {
  return (
    <div className="container mx-auto mt-24">
      <Heading className=" text-center  mb-6 text-lg md:text-2xl">
        What We offer for Free ?
      </Heading>

      <div className="container mx-auto  grid grid-cols-1 md:grid-cols-3 gap-5  ">
        {data.map((data, index) => {
          return (
            <div
              className="flex flex-col justify-center items-center bg-white p-5 md:px-20 space-y-2 shadow-lg "
              key={index}
            >
              <Image className="w-16 " src={data.logoUrl} alt="@" />
              <Heading className="font-bold ">{data.heading}</Heading>
              <Description className="text-center text-xs text-gray-500 px-2 indent-2">
                {data.description}
              </Description>
              <Button
                customClassName=" text-indigo-800 w-fit"
                link={data.link}
                disabled={data.buttonText == 'Coming Soon'}
              >
                {data.buttonText}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuidelineCards;
