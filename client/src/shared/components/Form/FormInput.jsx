// src/shared/components/Form/FormInput.jsx
import { useState } from 'react';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

export default function FormInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    icon: Icon = null,
    className = '',
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

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
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <input
                    id={name}
                    name={name}
                    type={isPassword && showPassword ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                        ${Icon ? 'pl-10' : ''}
                        ${isPassword || error ? 'pr-10' : ''}
                        ${error
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 ring-1 ring-red-100'
                            : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d] focus:ring-2 focus:ring-opacity-20'
                        }
                        ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
                        focus:outline-none
                    `}
                    {...props}
                />

                {/* Password Toggle */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}

                {/* Error Icon */}
                {error && !isPassword && (
                    <FaExclamationCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                )}
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
