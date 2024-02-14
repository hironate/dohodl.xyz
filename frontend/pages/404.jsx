import React from 'react';

const Error = () => {
  return (
    <div className="flex items-center justify-center  pt-20 pb-6">
      <div className="flex flex-col">
        <div className="flex flex-col items-center">
          <div className="text-indigo-500 font-bold text-5xl">404</div>

          <div className="font-bold text-3xl xl:text-5xl lg:text-5xl md:text-5xl mt-10">
            This page does not exist
          </div>

          <div className="text-gray-400 font-medium text-sm md:text-xl lg:text-xl mt-8">
            The page you are looking for could not be found.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
