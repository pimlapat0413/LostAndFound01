'use client';

import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options = [],
      placeholder = 'กรุณาเลือก...',
      error,
      helperText,
      icon,
      fullWidth = true,
      required,
      className = '',
      id,
      disabled,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    const hasNoSelectedValue =
      (value === undefined || value === '') &&
      (defaultValue === undefined || defaultValue === '');

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} flex flex-col gap-1.5`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-gray-400 flex items-center justify-center top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}

          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            className={`w-full appearance-none rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
              error
                ? 'border-red-400 bg-red-50/30 text-gray-900 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-600 focus:ring-blue-100 text-gray-900'
            } ${icon ? 'pl-10' : 'pl-3.5'} pr-10 py-2.5 cursor-pointer ${
              hasNoSelectedValue ? 'text-gray-400' : 'text-gray-900'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-gray-900">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-gray-400 flex items-center justify-center top-1/2 -translate-y-1/2">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
