import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import Button from '../common/Button';

const CustomerSection = () => {
  const navigate = useNavigate();

  const features = [
    'Easy doctor consultations',
    'Digital prescription storage',
    'Medicine home delivery',
    'Secure payment options',
  ];

  return (
    <section id="for-customers" className="py-24 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex justify-center md:col-span-2 order-2 md:order-1"
          >
            <div className="relative w-72 h-72 bg-linear-to-br from-[#003399] to-[#4FA64F] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
              <FaShoppingCart className="text-white text-8xl" />
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl" />
            </div>
          </motion.div>

          {/* Vertical Separator */}
          <div className="hidden md:flex justify-center items-center md:col-span-1 order-2">
            <div className="w-1.5 h-64 bg-linear-to-b from-[#003399] via-[#2E8B57] to-[#4FA64F] rounded-full shadow-md" />
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-left md:col-span-2 order-1 md:order-2"
          >
            <h2 className="text-4xl font-extrabold text-[#003399] mb-6">
              For Patients & Customers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Access quality healthcare from the comfort of your home. Connect
              with verified doctors, get digital prescriptions, and order
              medicines with guaranteed delivery.
            </p>

            <ul className="text-gray-700 space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              label="Customer Sign Up"
              onClick={() => navigate('/customer/signup')}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;
