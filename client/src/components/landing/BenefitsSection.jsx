import React from 'react';
import {
  FaMobileAlt,
  FaShieldAlt,
  FaClock,
  FaUserMd,
  FaUserPlus,
  FaShoppingCart,
} from 'react-icons/fa';
import AnimatedCard from '../common/AnimatedCard';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <FaMobileAlt />,
      title: '24/7 Access',
      desc: 'Platform available round the clock for your convenience',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure & Private',
      desc: 'Your data and consultations are completely secure',
    },
    {
      icon: <FaClock />,
      title: 'Save Time',
      desc: 'No more waiting rooms - get instant access to healthcare',
    },
    {
      icon: <FaUserMd />,
      title: 'Verified Doctors',
      desc: 'All healthcare professionals are thoroughly verified',
    },
    {
      icon: <FaUserPlus />,
      title: 'Easy Signup',
      desc: 'Simple registration process, get started in minutes',
    },
    {
      icon: <FaShoppingCart />,
      title: 'Seamless Orders',
      desc: 'From consultation to delivery - all in one place',
    },
  ];

  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-[#003399] mb-14">
          Why Join Philbox Connect?
        </h2>

        <div className="grid gap-10 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <AnimatedCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.desc}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
