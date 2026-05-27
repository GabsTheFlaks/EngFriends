import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg pr-4 pl-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50';

  const variants = {
    primary: 'bg-eng-blue text-white hover:bg-slate-800',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
