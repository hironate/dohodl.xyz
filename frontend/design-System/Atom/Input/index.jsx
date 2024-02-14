import React from 'react';

export const Input = ({
  label,
  type,
  id,
  placeholder,
  onChange,
  error,
  errorMsg,
  ref,
}) => {
  const className = [
    'bg-transparent',
    'w-28',
    'text-lg',
    error && 'outline-red-500',
  ].join(' ');
  return (
    <div className=" space-y-3   font-semibold">
      <h3 className="mb-2">{label}</h3>
      <input
        type={type}
        id={id}
        className={className}
        placeholder={placeholder}
        onChange={onChange}
        ref={ref}
      />
      {error && <h1 className="inline text-xs text-red-500">{errorMsg}</h1>}
    </div>
  );
};
