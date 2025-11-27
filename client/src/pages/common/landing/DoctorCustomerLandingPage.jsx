import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FaUserMd,
  FaUserPlus,
  FaStethoscope,
  FaShoppingCart,
  FaMobileAlt,
  FaShieldAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from 'react-icons/fa';
import logo from '../../../assets/icons/logo.png';

const DoctorCustomerLanding = () => {
  const navigate = useNavigate();

  const handleSignupClick = role => {
    navigate(`/${role}/signup`);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const Button = ({ label, onClick, variant = 'primary' }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`cursor-pointer px-8 py-3 rounded-md font-semibold shadow-md border transition-all ${
        variant === 'primary'
          ? 'bg-white text-[#003399] border-[#E0E0E0] hover:shadow-lg hover:bg-gray-50'
          : 'bg-[#003399] text-white border-[#003399] hover:bg-[#002266] hover:shadow-lg'
      }`}
    >
      {label}
    </motion.button>
  );

  return (
    <div className="font-[Segoe UI] text-[#2D3748] bg-linear-to-br from-[#F8F9FA] via-white to-[#F0F7F0]">
      {/* Header */}
      <header className="fixed w-full top-0 bg-white/95 shadow-md border-b border-[#7AC143]/30 z-50 backdrop-blur-md">
        <nav className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-2xl font-extrabold"
          >
            <img
              src={logo}
              alt="Philbox Logo"
              className="w-10 h-10 rounded-full shadow-md object-cover"
            />
            <span className="bg-linear-to-r from-[#003399] to-[#4FA64F] bg-clip-text text-transparent">
              Philbox Connect
            </span>
          </motion.div>

          <ul className="hidden md:flex gap-10 ml-10">
            {[
              'Home',
              'For Doctors',
              'For Customers',
              'Benefits',
              'Support',
            ].map(item => (
              <motion.li
                key={item}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <a
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="relative font-medium text-gray-700 hover:text-[#003399] transition-colors duration-200"
                >
                  {item}
                </a>
              </motion.li>
            ))}
          </ul>

          <div className="flex gap-4">
            <Button label="Login" onClick={handleLoginClick} />
            <Button
              label="Sign Up"
              onClick={() => handleSignupClick('customer')}
              variant="secondary"
            />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative text-white bg-linear-to-br from-[#003399] via-[#2E8B57] to-[#4FA64F] pt-[140px] pb-[100px] mt-[70px] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-[900px] mx-auto text-center"
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="cursor-pointer bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-[#003399] transition-all"
            >
              Back to Main Site
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-24 h-24 bg-white/15 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-10 right-20 w-32 h-32 bg-white/15 rounded-full blur-2xl"
        ></motion.div>
      </section>

      {/* For Doctors Section */}
      <section id="for-doctors" className="relative py-24 bg-white">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-[#003399] to-[#4FA64F]"></div>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-left md:col-span-2"
            >
              <h2 className="text-4xl font-extrabold text-[#003399] mb-6">
                For Healthcare Professionals
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Expand your practice with our digital platform. Reach more
                patients, manage appointments efficiently, and provide seamless
                care through e-prescriptions.
              </p>
              <ul className="text-gray-700 space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Digital prescription management
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Online appointment scheduling
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Patient record access
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Secure communication platform
                </li>
              </ul>
              <Button
                label="Doctor Sign Up"
                onClick={() => handleSignupClick('doctor')}
              />
            </motion.div>

            <div className="hidden md:flex justify-center items-center md:col-span-1">
              <div className="w-1.5 h-64 bg-linear-to-b from-[#003399] via-[#2E8B57] to-[#4FA64F] rounded-full shadow-md"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative flex justify-center md:col-span-2"
            >
              <div className="relative w-72 h-72 bg-linear-to-br from-[#003399] to-[#4FA64F] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                <FaStethoscope className="text-white text-8xl" />
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Customers Section */}
      <section id="for-customers" className="py-24 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative flex justify-center md:col-span-2 order-2 md:order-1"
            >
              <div className="relative w-72 h-72 bg-linear-to-br from-[#003399] to-[#4FA64F] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                <FaShoppingCart className="text-white text-8xl" />
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
              </div>
            </motion.div>

            <div className="hidden md:flex justify-center items-center md:col-span-1 order-2">
              <div className="w-1.5 h-64 bg-linear-to-b from-[#003399] via-[#2E8B57] to-[#4FA64F] rounded-full shadow-md"></div>
            </div>

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
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Easy doctor consultations
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Digital prescription storage
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Medicine home delivery
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA64F] rounded-full"></div>
                  Secure payment options
                </li>
              </ul>
              <Button
                label="Customer Sign Up"
                onClick={() => handleSignupClick('customer')}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-[#003399] mb-14">
            Why Join Philbox Connect?
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {[
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
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition bg-white"
              >
                <div className="text-4xl text-white bg-linear-to-br from-[#003399] to-[#4FA64F] w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5 shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-gray-800 font-semibold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="relative bg-linear-to-br from-[#003399] to-[#4FA64F] text-white text-center py-24">
        <motion.div
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-[900px] mx-auto"
        >
          <h2 className="text-4xl font-light mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of doctors and customers already using Philbox
            Connect.
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

      {/* Footer */}
      <footer
        id="support"
        className="relative bg-gray-900 text-white py-14 px-6"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-[#003399] to-[#4FA64F]"></div>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img
                src={logo}
                alt="Philbox Logo"
                className="w-10 h-10 rounded-full shadow-md object-cover border border-white/10"
              />
              <h3 className="text-2xl font-bold text-[#4FA64F]">
                Philbox Connect
              </h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Connecting doctors and customers through Pakistan's most trusted
              digital healthcare platform.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#4FA64F]">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                'Home',
                'For Doctors',
                'For Customers',
                'Benefits',
                'Support',
              ].map(link => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#4FA64F]">
              Contact Support
            </h4>
            <p className="text-gray-400 mb-2">📧 connect-support@philbox.pk</p>
            <p className="text-gray-400 mb-4">📍 Lahore, Pakistan</p>
            <div className="flex justify-center md:justify-start gap-4 text-2xl">
              <a
                href="#"
                className="hover:text-[#4FA64F] transition transform hover:scale-110"
              >
                <FaFacebook />
              </a>
              <a
                href="#"
                className="hover:text-[#4FA64F] transition transform hover:scale-110"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="hover:text-[#4FA64F] transition transform hover:scale-110"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="hover:text-[#4FA64F] transition transform hover:scale-110"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-10"></div>
        <div className="text-center text-gray-400 text-sm">
          © 2025{' '}
          <span className="font-semibold text-[#4FA64F]">
            Philbox Pharmaceuticals
          </span>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DoctorCustomerLanding;
