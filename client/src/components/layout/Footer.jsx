import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import logo from '../../assets/icons/logo.png';

const Footer = () => {
  const quickLinks = [
    'Home',
    'For Doctors',
    'For Customers',
    'Benefits',
    'Support',
  ];

  const socialLinks = [
    { icon: <FaFacebook />, href: '#', label: 'Facebook' },
    { icon: <FaTwitter />, href: '#', label: 'Twitter' },
    { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
    { icon: <FaInstagram />, href: '#', label: 'Instagram' },
  ];

  return (
    <footer id="support" className="relative bg-gray-900 text-white py-14 px-6">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-[#003399] to-[#4FA64F]"></div>

      <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-10 text-center md:text-left">
        {/* Brand Section */}
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

        {/* Quick Links Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-[#4FA64F]">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map(link => (
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

        {/* Contact Section */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-[#4FA64F]">
            Contact Support
          </h4>
          <p className="text-gray-400 mb-2">📧 connect-support@philbox.pk</p>
          <p className="text-gray-400 mb-4">📍 Lahore, Pakistan</p>

          {/* Social Links */}
          <div className="flex justify-center md:justify-start gap-4 text-2xl">
            {socialLinks.map(social => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="hover:text-[#4FA64F] transition transform hover:scale-110"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full h-px bg-white/10 my-10"></div>
      <div className="text-center text-gray-400 text-sm">
        © 2025{' '}
        <span className="font-semibold text-[#4FA64F]">
          Philbox Pharmaceuticals
        </span>
        . All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
