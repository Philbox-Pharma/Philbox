import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion as _motion, AnimatePresence } from 'framer-motion';
import {
  FaUserMd,
  FaUserPlus,
  FaStethoscope,
  FaShoppingCart,
  FaMobileAlt,
  FaShieldAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPills,
  FaHeartbeat,
  FaAmbulance,
  FaHospital,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaStar,
  FaQuoteLeft,
  FaArrowRight,
  FaCheck,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';

export default function CustomerLanding() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Scroll effect for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Data
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'For Doctors', href: '#for-doctors' },
    { name: 'For Patients', href: '#for-patients' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const stats = [
    { number: '10K+', label: 'Happy Patients' },
    { number: '500+', label: 'Verified Doctors' },
    { number: '50K+', label: 'Prescriptions' },
    { number: '99%', label: 'Satisfaction' },
  ];

  const services = [
    {
      icon: FaUserMd,
      title: 'Online Consultations',
      desc: 'Connect with doctors via video call from anywhere',
      color: '#003399',
    },
    {
      icon: FaPills,
      title: 'Medicine Delivery',
      desc: 'Get medicines delivered to your doorstep',
      color: '#4FA64F',
    },
    {
      icon: FaHeartbeat,
      title: 'Health Monitoring',
      desc: 'Track your health records digitally',
      color: '#E74C3C',
    },
    {
      icon: FaHospital,
      title: 'Lab Tests',
      desc: 'Book lab tests with home sample collection',
      color: '#9B59B6',
    },
    {
      icon: FaAmbulance,
      title: '24/7 Emergency',
      desc: 'Round the clock emergency support',
      color: '#F39C12',
    },
    {
      icon: FaShieldAlt,
      title: 'Health Insurance',
      desc: 'Cashless treatment at partner hospitals',
      color: '#1ABC9C',
    },
  ];

  const doctorFeatures = [
    'Digital Prescription Management',
    'Online Appointment Scheduling',
    'Patient Record Access',
    'Video Consultation Platform',
    'Earnings Dashboard & Analytics',
    'Verified Badge & Profile',
  ];

  const patientFeatures = [
    'Book Appointments Instantly',
    'Digital Prescription Storage',
    'Medicine Home Delivery',
    'Secure Payment Options',
    'Health Record Management',
    '24/7 Customer Support',
  ];

  const testimonials = [
    {
      name: 'Dr. Ahmed Khan',
      role: 'Cardiologist',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'Philbox has transformed my practice. I can now reach patients across Pakistan and provide consultations seamlessly.',
      rating: 5,
    },
    {
      name: 'Sara Ali',
      role: 'Patient',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'Getting medicines delivered to my home has never been easier. The doctors are professional and caring.',
      rating: 5,
    },
    {
      name: 'Dr. Fatima Noor',
      role: 'Gynecologist',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      text: 'The platform is intuitive and my patients love the convenience. Highly recommend for all healthcare professionals.',
      rating: 5,
    },
  ];

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Blog', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQs', href: '#' },
      { name: 'Live Chat', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'HIPAA Compliance', href: '#' },
    ],
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="font-sans text-gray-800 overflow-x-hidden">
      {/* ============ HEADER - Always White ============ */}
      {/* ============ HEADER ============ */}
      <motion.header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-3'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo with shiny white background (always) */}
          <motion.div
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/Philbox.PNG"
              alt="Philbox"
              className="h-10 w-auto"
              onError={e => {
                e.target.onerror = null;
                e.target.src = '/vite.svg';
              }}
            />
          </motion.div>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <motion.li key={link.name} whileHover={{ scale: 1.1 }}>
                <a
                  href={link.href}
                  className={`font-medium transition-colors ${
                    scrolled
                      ? 'text-gray-700 hover:text-[#003399]'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.name}
                </a>
              </motion.li>
            ))}
          </ul>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                scrolled
                  ? 'text-[#003399] border-2 border-[#003399] hover:bg-[#003399] hover:text-white'
                  : 'text-white border-2 border-white hover:bg-white hover:text-[#003399]'
              }`}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-6 py-2 rounded-full font-medium bg-[#4FA64F] text-white hover:bg-[#3d8c3d] transition-all"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FaTimes className={scrolled ? 'text-gray-800' : 'text-white'} />
            ) : (
              <FaBars className={scrolled ? 'text-gray-800' : 'text-white'} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white shadow-lg border-t"
            >
              <div className="px-6 py-4 space-y-4">
                {navLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-gray-700 hover:text-[#003399] font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-3 rounded-full border-2 border-[#003399] text-[#003399] font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-3 rounded-full bg-[#4FA64F] text-white font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ============ HERO SECTION ============ */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          background:
            'linear-gradient(135deg, #003399 0%, #0052cc 50%, #4FA64F 100%)',
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Floating Medical Icons */}
        <motion.div
          className="absolute top-1/4 left-10 text-white/20 text-6xl hidden md:block"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <FaStethoscope />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-10 text-white/20 text-6xl hidden md:block"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <FaHeartbeat />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 text-white/20 text-5xl hidden md:block"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <FaPills />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-6 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6 backdrop-blur-sm border border-white/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              🏥 Pakistan's #1 Healthcare Platform
            </motion.span>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your Health, Our
              <span className="block text-[#7CF584]">Priority</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Connect with verified doctors, book appointments, get medicines
              delivered, and manage your health journey - all in one place.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-[#003399] rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
              >
                Get Started Free
                <FaArrowRight />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/doctor/login')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#003399] transition-all flex items-center gap-2"
              >
                <FaUserMd />
                I'm a Doctor
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <p className="text-2xl md:text-4xl font-bold text-white">
                    {stat.number}
                  </p>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <a href="#services" className="text-white/80 hover:text-white">
            <FaChevronDown className="text-2xl" />
          </a>
        </motion.div>
      </section>

      {/* ============ SERVICES SECTION ============ */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-[#4FA64F] font-semibold text-sm uppercase tracking-wider">
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mt-2 mb-4">
              Complete Healthcare Solutions
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need for your health journey, accessible from
              anywhere
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{
                  y: -10,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-100"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon
                    className="text-3xl"
                    style={{ color: service.color }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FOR DOCTORS SECTION ============ */}
      <section id="for-doctors" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <span className="text-[#003399] font-semibold text-sm uppercase tracking-wider">
                For Doctors
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-6">
                Grow Your Practice{' '}
                <span className="text-[#003399]">Digitally</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Join thousands of healthcare professionals who are expanding
                their reach and providing better care through our platform.
              </p>

              <ul className="space-y-4 mb-8">
                {doctorFeatures.map((feature, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#4FA64F] flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/doctor/register')}
                  className="px-8 py-3 bg-[#003399] text-white rounded-full font-semibold hover:bg-[#002277] transition-all shadow-lg hover:shadow-xl"
                >
                  Register as Doctor
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/doctor/login')}
                  className="px-8 py-3 border-2 border-[#003399] text-[#003399] rounded-full font-semibold hover:bg-[#003399] hover:text-white transition-all"
                >
                  Doctor Login
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="relative"
            >
              <div
                className="w-full aspect-square max-w-lg mx-auto rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #003399 0%, #0052cc 100%)',
                }}
              >
                <FaStethoscope className="text-white/90 text-[120px] md:text-[180px]" />

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-8 right-8 bg-white rounded-2xl p-4 shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-[#003399] font-bold text-lg">500+</p>
                  <p className="text-gray-500 text-sm">Doctors</p>
                </motion.div>

                <motion.div
                  className="absolute bottom-8 left-8 bg-white rounded-2xl p-4 shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <p className="text-[#4FA64F] font-bold text-lg">4.9 ⭐</p>
                  <p className="text-gray-500 text-sm">Rating</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FOR PATIENTS SECTION ============ */}
      <section
        id="for-patients"
        className="py-24 bg-gradient-to-br from-gray-50 to-green-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="order-2 lg:order-1 relative"
            >
              <div
                className="w-full aspect-square max-w-lg mx-auto rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #4FA64F 0%, #2E8B57 100%)',
                }}
              >
                <FaShoppingCart className="text-white/90 text-[120px] md:text-[180px]" />

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-8 left-8 bg-white rounded-2xl p-4 shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-[#4FA64F] font-bold text-lg">10K+</p>
                  <p className="text-gray-500 text-sm">Patients</p>
                </motion.div>

                <motion.div
                  className="absolute bottom-8 right-8 bg-white rounded-2xl p-4 shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <p className="text-[#003399] font-bold text-lg">24/7</p>
                  <p className="text-gray-500 text-sm">Support</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="order-1 lg:order-2"
            >
              <span className="text-[#4FA64F] font-semibold text-sm uppercase tracking-wider">
                For Patients
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-6">
                Healthcare at Your{' '}
                <span className="text-[#4FA64F]">Fingertips</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Experience seamless healthcare from consultation to medicine
                delivery. Your health journey made simple and accessible.
              </p>

              <ul className="space-y-4 mb-8">
                {patientFeatures.map((feature, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#4FA64F] flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-[#4FA64F] text-white rounded-full font-semibold hover:bg-[#3d8c3d] transition-all shadow-lg hover:shadow-xl"
                >
                  Create Account
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 border-2 border-[#4FA64F] text-[#4FA64F] rounded-full font-semibold hover:bg-[#4FA64F] hover:text-white transition-all"
                >
                  Login
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-[#4FA64F] font-semibold text-sm uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#003399] mt-2 mb-4">
              What People Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Trusted by thousands of doctors and patients across Pakistan
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
              >
                <FaQuoteLeft className="text-4xl text-[#003399]/20 mb-6" />
                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed italic">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-gray-500">
                      {testimonials[activeTestimonial].role}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonials[activeTestimonial].rating)].map(
                        (_, i) => (
                          <FaStar key={i} className="text-yellow-400 text-sm" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? 'bg-[#003399] w-8'
                      : 'bg-gray-300 w-3 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #003399 0%, #0052cc 50%, #4FA64F 100%)',
        }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: Math.random() * 200 + 100,
                height: Math.random() * 200 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join Philbox today and experience healthcare the way it should be -
            accessible, affordable, and always available.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-[#003399] rounded-full font-bold text-lg shadow-xl"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/doctor/register')}
              className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-[#003399] transition-all"
            >
              Join as Doctor
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" className="bg-gray-900 text-white">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                {/* Shiny white logo wrapper */}
                <div className="p-1.5 rounded-2xl bg-white shadow-[0_0_25px_rgba(255,255,255,0.6)] border border-white/70">
                  <img
                    src="/Philbox.PNG"
                    alt="Philbox"
                    className="h-20 w-auto"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/vite.svg';
                    }}
                  />
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Pakistan's trusted digital healthcare platform connecting
                doctors, patients, and pharmacies for better health outcomes.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: FaFacebook, href: '#', color: 'hover:text-blue-500' },
                  { icon: FaTwitter, href: '#', color: 'hover:text-sky-400' },
                  {
                    icon: FaInstagram,
                    href: '#',
                    color: 'hover:text-pink-500',
                  },
                  { icon: FaLinkedin, href: '#', color: 'hover:text-blue-400' },
                  { icon: FaYoutube, href: '#', color: 'hover:text-red-500' },
                  {
                    icon: FaWhatsapp,
                    href: '#',
                    color: 'hover:text-green-500',
                  },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.2, y: -3 }}
                    className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ${social.color} transition-all`}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#4FA64F] transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#4FA64F] transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-[#4FA64F]" />
                  </div>
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-[#4FA64F]" />
                  </div>
                  <span>support@philbox.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-[#4FA64F]" />
                  </div>
                  <span>Lahore, Pakistan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">
                © 2025{' '}
                <span className="text-[#4FA64F]">Philbox Pharmaceuticals</span>.
                All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                {footerLinks.legal.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="hover:text-[#4FA64F] transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
