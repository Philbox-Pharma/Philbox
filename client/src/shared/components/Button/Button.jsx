/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ label, onClick, variant = 'primary', className = '' }) => {
  const baseStyles =
    'cursor-pointer px-8 py-3 rounded-md font-semibold shadow-md transition-all';

  const variantStyles = {
    primary:
      'bg-white text-[#003399] border border-[#E0E0E0] hover:shadow-lg hover:bg-gray-50',
    secondary:
      'bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#003399]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {label}
    </motion.button>
  );
};

export default Button;
