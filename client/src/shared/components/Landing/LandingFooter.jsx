// src/shared/components/Landing/LandingFooter.jsx
import { motion as _motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from 'react-icons/fa';

const socialIconMap = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
};

const socialColorMap = {
  facebook: 'hover:text-blue-500',
  twitter: 'hover:text-sky-400',
  linkedin: 'hover:text-blue-400',
  instagram: 'hover:text-pink-500',
  youtube: 'hover:text-red-500',
  whatsapp: 'hover:text-green-500',
};

export default function LandingFooter({
  id = 'contact',
  logoSrc = '/Philbox.PNG',
  description = '',
  footerLinks = {},
  contactInfo = {},
  socialLinks = [],
  theme = {},
  copyrightText = '',
}) {
  const secondaryColor = theme.secondary || '#4FA64F';

  return (
    <footer id={id} className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-1.5 rounded-2xl bg-white shadow-[0_0_25px_rgba(255,255,255,0.6)] border border-white/70">
                <img
                  src={logoSrc}
                  alt="Philbox"
                  className="h-20 w-auto"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/vite.svg';
                  }}
                />
              </div>
            </div>
            {description && (
              <p className="text-gray-400 mb-6 max-w-sm">{description}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social, i) => {
                  const IconComponent =
                    socialIconMap[social.icon] || FaLinkedin;
                  const colorClass =
                    socialColorMap[social.icon] || 'hover:text-blue-400';
                  return (
                    <motion.a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -3 }}
                      className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ${colorClass} transition-all`}
                    >
                      <IconComponent />
                    </motion.a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Company Links */}
          {footerLinks.company && (
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[var(--secondary)] transition-colors"
                      style={{ '--secondary': secondaryColor }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support Links */}
          {footerLinks.support && (
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[var(--secondary)] transition-colors"
                      style={{ '--secondary': secondaryColor }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.phone && (
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaPhone style={{ color: secondaryColor }} />
                  </div>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope style={{ color: secondaryColor }} />
                  </div>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo.address && (
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt style={{ color: secondaryColor }} />
                  </div>
                  <span>{contactInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              {copyrightText || (
                <>
                  © 2025{' '}
                  <span style={{ color: secondaryColor }}>
                    Philbox Pharmaceuticals
                  </span>
                  . All rights reserved.
                </>
              )}
            </p>
            {footerLinks.legal && (
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                {footerLinks.legal.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="hover:text-[var(--secondary)] transition-colors"
                    style={{ '--secondary': secondaryColor }}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
