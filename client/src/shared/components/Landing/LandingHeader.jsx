// src/shared/components/Landing/LandingHeader.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function LandingHeader({
  navLinks = [],
  authButtons = {},
  theme = {},
  logoSrc = '/Philbox.PNG',
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryColor = theme.primary || '#003399';

  return (
    <motion.header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-3'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          className="flex items-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src={logoSrc}
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
                    ? 'text-gray-700 hover:text-(--primary)'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ '--primary': primaryColor }}
              >
                {link.name}
              </a>
            </motion.li>
          ))}
        </ul>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {authButtons.secondary && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={authButtons.secondary.onClick}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                scrolled
                  ? 'border-2 hover:text-white'
                  : 'text-white border-2 border-white hover:bg-white'
              }`}
              style={{
                borderColor: scrolled ? primaryColor : 'white',
                color: scrolled ? primaryColor : 'white',
                '--hover-bg': primaryColor,
              }}
            >
              {authButtons.secondary.label}
            </motion.button>
          )}
          {authButtons.primary && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={authButtons.primary.onClick}
              className="px-6 py-2 rounded-full font-medium text-white transition-all flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {authButtons.primary.icon && (
                <authButtons.primary.icon className="text-sm" />
              )}
              {authButtons.primary.label}
            </motion.button>
          )}
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
                  className="block text-gray-700 hover:text-(--primary) font-medium py-2"
                  style={{ '--primary': primaryColor }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex gap-4 pt-4 border-t">
                {authButtons.secondary && (
                  <button
                    onClick={() => {
                      authButtons.secondary.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-3 rounded-full border-2 font-medium"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                    }}
                  >
                    {authButtons.secondary.label}
                  </button>
                )}
                {authButtons.primary && (
                  <button
                    onClick={() => {
                      authButtons.primary.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-3 rounded-full text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {authButtons.primary.label}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
