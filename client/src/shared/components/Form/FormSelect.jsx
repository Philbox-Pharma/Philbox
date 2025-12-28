// src/shared/components/Form/FormSelect.jsx
import { FaExclamationCircle } from 'react-icons/fa';

export default function FormSelect({
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    placeholder = 'Select an option',
    error = '',
    required = false,
    disabled = false,
    className = ''
}) {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-2.5 rounded-lg border transition-all duration-200 appearance-none bg-white
                        ${error
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 ring-1 ring-red-100 pr-10'
                            : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d] focus:ring-2 focus:ring-opacity-20'
                        }
                        ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
                        focus:outline-none
                    `}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom Chevron (Optional) */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    {error ? (
                        <FaExclamationCircle className="text-red-500 mr-2" />
                    ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1 animate-fadeIn">
                    {error}
                </p>
            )}
        </div>
    );
}
