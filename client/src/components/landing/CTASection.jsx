import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Button from '../common/Button';

const CTASection = () => {
  const navigate = useNavigate();

  const handleSignupClick = role => {
    navigate(`/${role}/signup`);
  };

  return (
    <section className="relative bg-linear-to-br from-[#003399] to-[#4FA64F] text-white text-center py-24">
      <motion.div
        whileInView={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-[900px] mx-auto px-6"
      >
        <h2 className="text-4xl font-light mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-8 opacity-90">
          Join thousands of doctors and customers already using Philbox Connect.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            label="Doctor Sign Up"
            onClick={() => handleSignupClick('doctor')}
          />
          <Button
            label="Customer Sign Up"
            onClick={() => handleSignupClick('customer')}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
