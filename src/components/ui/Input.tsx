'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-white/80">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-2xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 transition-all focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-400/60 focus:border-red-400/60 focus:ring-red-300/45'
                : 'border-white/20 focus:border-primary-300/60 focus:ring-primary-300/45'
            } ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-white/45">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
