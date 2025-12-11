/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../shared/components/Button';

const CTASection = () => {
  const handleLoginClick = () => {
    window.location.href = '/admin/login';
  };

  return (
    <section className="relative bg-linear-to-br from-[#003399] via-[#1a5299] to-[#2E8B57] text-white text-center py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4FA64F] rounded-full blur-3xl"></div>
      </div>

      <motion.div
        whileInView={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-6"
      >
        <h2 className="text-4xl md:text-5xl font-light mb-6">
          Ready to Manage Your Platform?
        </h2>
        <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
          Access your administrative dashboard with secure credentials. Monitor,
          manage, and optimize your entire ecosystem.
        </p>
        <Button label="Access Dashboard" onClick={handleLoginClick} />
      </motion.div>
    </section>
  );
};

export default CTASection;
