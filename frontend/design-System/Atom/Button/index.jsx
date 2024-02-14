import Link from 'next/link';
import React from 'react';
import { Spinner } from '../Spinner';

export const Button = ({
  blocked,
  rounded,
  onClick,
  children,
  loading,
  active,
  disabled,
  customClassName,
  link,
}) => {
  const className = [
    'button',
    'text-white',
    'bg-blue-600',
    'mx-auto',
    'px-2 md:px-8 md:py-3 ',
    rounded ? `rounded-2xl` : 'rounded-lg',
    'flex items-center justify-center', // alignment
    blocked && 'w-full block',
    disabled || loading ? 'disabled cursor-not-allowed' : 'cursor-pointer',
    'hover:bg-blue-700  hover:shadow-md',
  ].join(' ');

  return link ? (
    <Link href={link}>
      <button
        className={customClassName || className}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </Link>
  ) : (
    <button
      className={customClassName || className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}

      {loading && <Spinner />}
    </button>
  );
};
