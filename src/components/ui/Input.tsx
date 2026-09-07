'use client';

import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export type InputBaseProps = {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
};

export type TextInputProps = InputBaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input';
  };

export type TextAreaProps = InputBaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
    rows?: number;
  };

export type InputProps = TextInputProps | TextAreaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const {
      label,
      error,
      helperText,
      icon,
      fullWidth = true,
      required,
      className = '',
      id,
      as = 'input',
      disabled,
      ...rest
    } = props;

    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    const baseControlClasses = `w-full rounded-lg border transition-colors duration-150 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
      error
        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-600 focus:ring-blue-100'
    } ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5`;

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} flex flex-col gap-1.5`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div
              className={`absolute left-3.5 pointer-events-none text-gray-400 flex items-center justify-center ${
                as === 'textarea' ? 'top-3' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              {icon}
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              id={inputId}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              disabled={disabled}
              rows={(props as TextAreaProps).rows || 4}
              className={`${baseControlClasses} resize-y min-h-[90px] ${className}`}
              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as React.Ref<HTMLInputElement>}
              disabled={disabled}
              className={`${baseControlClasses} ${className}`}
              {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
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

Input.displayName = 'Input';

export default Input;
