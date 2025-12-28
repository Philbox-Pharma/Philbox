// src/shared/components/Form/FormTextarea.jsx
export default function FormTextarea({
    label,
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    rows = 4,
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
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`
                    w-full px-4 py-2.5 rounded-lg border transition-colors resize-none
                    ${error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#1a365d] focus:border-[#1a365d]'
                    }
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    focus:outline-none focus:ring-2
                `}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
