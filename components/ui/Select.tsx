import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options?: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    options = [],
    children,
    className = '',
    id,
    ...props
}) => {
    const selectId = id || React.useId();

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white outline-none transition-all appearance-none cursor-pointer
            ${error
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500'
                        } ${className}`}
                    {...props}
                >
                    {children || options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                </div>
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-slate-400">{helperText}</p>
            )}
        </div>
    );
};
