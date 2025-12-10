import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'textarea' | 'select';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  disabled?: boolean;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  options = [],
  rows = 3,
  disabled = false,
  error,
}) => {
  const baseClasses = `w-full px-4 py-2.5 border rounded-lg bg-background text-foreground
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error' : 'border-border'}`;

  return (
    <div className="flex flex-col">
      <label className="text-sm text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          disabled={disabled}
          className={`${baseClasses} resize-y`}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClasses} appearance-none pr-10`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={baseClasses}
        />
      )}
      
      {error && (
        <span className="text-xs text-error mt-1">{error}</span>
      )}
    </div>
  );
};

export default FormInput;