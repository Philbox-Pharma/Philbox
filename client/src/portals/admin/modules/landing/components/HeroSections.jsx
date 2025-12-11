/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { FaUserShield } from 'react-icons/fa';
import Button from '../../../shared/components/Button';

const HeroSection = () => {
  const handleLoginClick = () => {
    window.location.href = '/admin/login';
  };

  const handleMainSiteClick = () => {
    window.location.href = '/';
  };

  return (
    <section className="relative text-white bg-linear-to-br from-[#003399] via-[#1a5299] to-[#2E8B57] pt-36 pb-24 mt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4FA64F] rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto text-center px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-sm mb-6"
        >
          <FaUserShield className="text-6xl" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
          Administrator Control Center
        </h1>
        <p className="text-xl opacity-95 mb-10 max-w-2xl mx-auto leading-relaxed">
          Complete platform oversight with advanced management tools. Control
          all aspects of the Philbox ecosystem with enterprise-grade security
          and analytics.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button label="Access Dashboard" onClick={handleLoginClick} />
          <Button
            label="Back to Main Site"
            onClick={handleMainSiteClick}
            variant="secondary"
          />
        </div>
      </motion.div>

      {/* Animated Background Elements */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-40 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [360, 180, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-10 w-40 h-40 bg-[#4FA64F]/20 rounded-full blur-2xl"
      />
    </section>
  );
};

export default HeroSection;
