/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaDatabase,
  FaChartBar,
  FaClipboardList,
  FaBell,
  FaShieldAlt,
  FaChevronRight,
} from 'react-icons/fa';

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <FaUsers />,
      title: 'User Management',
      desc: 'Complete control over staff, customer, doctor, and salesperson accounts',
      details: [
        'Create and manage user accounts',
        'Role-based access control',
        'Activity monitoring',
        'Account suspension/activation',
      ],
    },
    {
      icon: <FaDatabase />,
      title: 'System Configuration',
      desc: 'Configure system-wide settings and parameters',
      details: [
        'Database management',
        'System preferences',
        'Integration settings',
        'Backup & restore',
      ],
    },
    {
      icon: <FaChartBar />,
      title: 'Analytics Dashboard',
      desc: 'Comprehensive insights into platform performance',
      details: [
        'Real-time statistics',
        'Revenue analytics',
        'User engagement metrics',
        'Performance reports',
      ],
    },
    {
      icon: <FaClipboardList />,
      title: 'Content Management',
      desc: 'Manage platform content and resources',
      details: [
        'Product catalog',
        'Prescription approvals',
        'Document verification',
        'Content moderation',
      ],
    },
    {
      icon: <FaBell />,
      title: 'Notifications & Alerts',
      desc: 'System-wide communication and alerts',
      details: [
        'Push notifications',
        'Email campaigns',
        'Emergency alerts',
        'Scheduled announcements',
      ],
    },
    {
      icon: <FaShieldAlt />,
      title: 'Security & Compliance',
      desc: 'Maintain security standards and regulatory compliance',
      details: [
        'Audit logs',
        'Security monitoring',
        'Compliance reports',
        'Data protection',
      ],
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#003399] mb-4">
            Complete Administrative Control
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Powerful tools designed for seamless platform management and
            oversight
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setActiveFeature(i)}
              className="group relative p-8 border-2 border-gray-200 rounded-2xl shadow-md hover:shadow-2xl hover:border-[#003399]/30 transition-all duration-300 bg-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#003399] to-[#4FA64F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

              <div className="text-4xl text-white bg-linear-to-br from-[#003399] to-[#4FA64F] w-16 h-16 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>

              <h3 className="text-gray-800 font-bold text-xl mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4">{item.desc}</p>

              <AnimatePresence>
                {activeFeature === i && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 text-sm text-gray-600"
                  >
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaChevronRight className="text-[#4FA64F] mt-1 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
