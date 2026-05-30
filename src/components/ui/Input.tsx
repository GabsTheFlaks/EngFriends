import React from 'react';

type InputProps = React.ComponentProps<"input"> & {
  icon?: React.ElementType;
  label: string;
  rightIcon?: React.ReactNode;
};

export function Input({ icon: Icon, label, rightIcon, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-eng-blue focus:ring-1 focus:ring-eng-blue ${Icon ? 'pl-9' : ''} ${rightIcon ? 'pr-10' : ''}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}
