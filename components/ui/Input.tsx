import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || React.useId();

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white outline-none transition-all placeholder-slate-400
          ${error
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500'
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-slate-400">{helperText}</p>
            )}
        </div>
    );
};
