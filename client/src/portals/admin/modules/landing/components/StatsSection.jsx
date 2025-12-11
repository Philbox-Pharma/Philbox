/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaCheckCircle,
  FaTachometerAlt,
  FaLock,
} from 'react-icons/fa';

const StatsSection = () => {
  const stats = [
    { value: '500+', label: 'Active Users', icon: <FaUsers /> },
    { value: '99.9%', label: 'Uptime', icon: <FaCheckCircle /> },
    { value: '24/7', label: 'Monitoring', icon: <FaTachometerAlt /> },
    { value: '100%', label: 'Secure', icon: <FaLock /> },
  ];

  return (
    <section className="relative -mt-16 z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="text-3xl text-[#003399] mb-3 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-[#003399] mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
