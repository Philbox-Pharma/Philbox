import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import logo from '../../assets/icons/logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F8F9FA] via-white to-[#F0F7F0] flex items-center justify-center px-4 py-8">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-32 h-32 bg-[#003399]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-[#4FA64F]/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <motion.img
            src={logo}
            alt="Philbox Logo"
            className="w-16 h-16 rounded-full mb-4 cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 5 }}
            onClick={() => navigate('/')}
          />
          <h1 className="text-3xl font-bold bg-linear-to-r from-[#003399] to-[#4FA64F] bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 mt-2 text-center">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        {children}

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 text-sm hover:text-gray-700 transition inline-flex items-center gap-2"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
