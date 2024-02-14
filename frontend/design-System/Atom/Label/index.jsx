import React from 'react';

export const Label = ({ children, className, onHoverTitle }) => {
  return (
    <div className={className} title={onHoverTitle}>
      {children}
    </div>
  );
};
