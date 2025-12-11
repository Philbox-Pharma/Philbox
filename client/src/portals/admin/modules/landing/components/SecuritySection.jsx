/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaShieldAlt,
  FaFileAlt,
  FaCheckCircle,
  FaUserShield,
} from 'react-icons/fa';

const SecuritySection = () => {
  const securityFeatures = [
    { icon: <FaLock />, text: 'End-to-end encryption' },
    { icon: <FaShieldAlt />, text: 'Multi-factor authentication' },
    { icon: <FaFileAlt />, text: 'Complete audit trails' },
    { icon: <FaCheckCircle />, text: 'HIPAA compliant' },
  ];

  return (
    <section
      id="security"
      className="py-24 bg-linear-to-br from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block px-4 py-2 bg-[#003399]/10 rounded-full mb-4">
            <span className="text-[#003399] font-semibold text-sm">
              ENTERPRISE SECURITY
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#003399] mb-6">
            Fort Knox-Level Security
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Your administrative access is protected by{' '}
            <strong className="text-[#003399]">
              military-grade encryption
            </strong>{' '}
            and multi-factor authentication. Every action is logged and
            monitored.
          </p>

          <div className="space-y-4">
            {securityFeatures.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-2xl text-[#4FA64F]">{item.icon}</div>
                <span className="text-gray-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative w-full h-96 bg-linear-to-br from-[#003399] to-[#4FA64F] rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-20"
            >
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-white rounded-full"></div>
            </motion.div>
            <FaUserShield className="text-white text-9xl relative z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;
