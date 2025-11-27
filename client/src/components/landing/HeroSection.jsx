import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Button from '../common/Button';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSignupClick = role => {
    navigate(`/${role}/signup`);
  };

  return (
    <section className="relative text-white bg-linear-to-br from-[#003399] via-[#2E8B57] to-[#4FA64F] pt-[140px] pb-[100px] mt-[70px] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-[900px] mx-auto text-center px-6"
      >
        <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight">
          Connect & Heal Together
        </h1>
        <p className="text-lg opacity-95 mb-8 max-w-[700px] mx-auto">
          Join Pakistan's premier digital healthcare platform. Doctors can
          expand their practice, customers can access quality healthcare - all
          in one secure ecosystem.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Button
            label="I'm a Doctor"
            onClick={() => handleSignupClick('doctor')}
          />
          <Button
            label="I'm a Customer"
            onClick={() => handleSignupClick('customer')}
          />
          <Button
            label="Back to Main Site"
            onClick={() => navigate('/')}
            variant="outline"
          />
        </div>
      </motion.div>

      {/* Floating Circles */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-10 w-24 h-24 bg-white/15 rounded-full blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-10 right-20 w-32 h-32 bg-white/15 rounded-full blur-2xl"
      />
    </section>
  );
};

export default HeroSection;
