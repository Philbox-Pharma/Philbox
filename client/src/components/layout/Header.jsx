import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import Button from '../common/Button';
import logo from '../../assets/icons/logo.png';
import useAuthStore from '../../stores/auth.store';

const Header = ({ showNav = true, showAuthButtons = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userRole } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    'Home',
    'For Doctors',
    'For Customers',
    'Benefits',
    'Support',
  ];

  const handleSignupClick = role => {
    navigate(`/${role}/signup`);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardClick = () => {
    const dashboardRoute =
      userRole === 'doctor' ? '/doctor/dashboard' : '/customer/dashboard';
    navigate(dashboardRoute);
  };

  return (
    <header className="fixed w-full top-0 bg-white/95 shadow-md border-b border-[#7AC143]/30 z-50 backdrop-blur-md">
      <nav className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-2xl font-extrabold cursor-pointer"
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

        {/* Desktop Navigation */}
        {showNav && (
          <ul className="hidden md:flex gap-10 ml-10">
            {navItems.map(item => (
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
        )}

        {/* Desktop Auth Buttons */}
        {showAuthButtons && (
          <div className="hidden md:flex gap-4">
            {isAuthenticated ? (
              <>
                <Button label="Dashboard" onClick={handleDashboardClick} />
                <Button
                  label="Logout"
                  onClick={handleLogout}
                  variant="secondary"
                />
              </>
            ) : (
              <>
                <Button label="Login" onClick={handleLoginClick} />
                <Button
                  label="Sign Up"
                  onClick={() => handleSignupClick('customer')}
                  variant="secondary"
                />
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-2xl text-[#003399]"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          {showNav && (
            <ul className="px-6 py-4 space-y-4">
              {navItems.map(item => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-medium text-gray-700 hover:text-[#003399] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {showAuthButtons && (
            <div className="px-6 pb-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button
                    label="Dashboard"
                    onClick={handleDashboardClick}
                    fullWidth
                  />
                  <Button
                    label="Logout"
                    onClick={handleLogout}
                    variant="secondary"
                    fullWidth
                  />
                </>
              ) : (
                <>
                  <Button label="Login" onClick={handleLoginClick} fullWidth />
                  <Button
                    label="Sign Up"
                    onClick={() => handleSignupClick('customer')}
                    variant="secondary"
                    fullWidth
                  />
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
};

export default Header;
