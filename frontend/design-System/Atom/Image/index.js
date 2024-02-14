import React from 'react';

export const Image = ({ src, alt, className, onClick }) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} onClick={onClick} />;
};
