// src/shared/components/Form/FormMultiSelect.jsx
import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

export default function FormMultiSelect({
    label,
    name,
    value = [],
    onChange,
    options = [],
    placeholder = 'Select options...',
    error = '',
    required = false,
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSelect = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];

        // Mock event object for consistent API
        onChange({ target: { name, value: newValue } });
    };

    const removeValue = (e, val) => {
        e.stopPropagation();
        onChange({ target: { name, value: value.filter(v => v !== val) } });
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full px-3 py-2 min-h-[42px] rounded-lg border bg-white cursor-pointer flex items-center justify-between
                    ${error ? 'border-red-500' : 'border-gray-300 focus-within:border-[#1a365d] focus-within:ring-1 focus-within:ring-[#1a365d]'}
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-wrap gap-2">
                    {value.length === 0 && (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                    {value.map(val => {
                        const opt = options.find(o => o.value === val);
                        return (
                            <span key={val} className="bg-[#1a365d]/10 text-[#1a365d] text-sm px-2 py-0.5 rounded flex items-center gap-1">
                                {opt?.label || val}
                                <FaTimes
                                    className="cursor-pointer hover:text-red-500"
                                    onClick={(e) => removeValue(e, val)}
                                />
                            </span>
                        );
                    })}
                </div>
                <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                        options.map(option => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`px-4 py-2 cursor-pointer text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                    value.includes(option.value) ? 'bg-blue-50 text-[#1a365d] font-medium' : 'text-gray-700'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(option.value)}
                                    readOnly
                                    className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                                />
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="p-3 text-center text-gray-500 text-sm">No options available</div>
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
