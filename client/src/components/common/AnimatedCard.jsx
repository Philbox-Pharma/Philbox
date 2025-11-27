import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const AnimatedCard = ({
  icon,
  title,
  description,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`p-8 border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition bg-white ${className}`}
    >
      <div className="text-4xl text-white bg-linear-to-br from-[#003399] to-[#4FA64F] w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5 shadow-lg">
        {icon}
      </div>
      <h3 className="text-gray-800 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default AnimatedCard;
