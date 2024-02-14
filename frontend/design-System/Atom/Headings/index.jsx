import React from 'react';

const Heading = ({ children, className }) => {
  return <h1 className={className}>{children}</h1>;
};

export const SubHeading = ({ children, className }) => {
  return <h3 className={className}>{children}</h3>;
};

export const Description = ({ children, className }) => {
  return <p className={className}>{children}</p>;
};

export default Heading;
