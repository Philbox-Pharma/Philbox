import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Button = ({
  label,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const baseStyles =
    'cursor-pointer px-8 py-3 rounded-md font-semibold shadow-md border transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-white text-[#003399] border-[#E0E0E0] hover:shadow-lg hover:bg-gray-50',
    secondary:
      'bg-[#003399] text-white border-[#003399] hover:bg-[#002266] hover:shadow-lg',
    outline:
      'bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#003399]',
    gradient:
      'bg-gradient-to-r from-[#003399] to-[#4FA64F] text-white border-none hover:shadow-xl',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {label}
    </motion.button>
  );
};

export default Button;
