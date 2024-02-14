import React from 'react';
import { ImSpinner8 } from 'react-icons/im';
// import { AiFillLock } from 'react-icons/ai';
export const Icon = ({ icon, className }) => {
  const IconName = icon;

  return <IconName className={className} />;
};
