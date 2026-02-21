// src/portals/admin/layouts/components/AdminFooter.jsx
import { Link } from 'react-router-dom';
import { FaHeart, FaShieldAlt, FaEnvelope, FaGlobe } from 'react-icons/fa';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <Link
              to="/admin/settings"
              className="text-gray-400 hover:text-gray-500"
              title="Settings"
            >
              <span className="sr-only">Settings</span>
              <FaShieldAlt className="text-xl" />
            </Link>
            <a
              href="mailto:support@philbox.com"
              className="text-gray-400 hover:text-gray-500"
              title="Support"
            >
              <span className="sr-only">Support</span>
              <FaEnvelope className="text-xl" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-500"
              title="Website"
            >
              <span className="sr-only">Website</span>
              <FaGlobe className="text-xl" />
            </a>
          </div>

          <div className="mt-8 md:mt-0 md:order-1">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <img
                  src="/Philbox.PNG"
                  alt="Philbox"
                  className="h-6 w-auto opacity-70"
                  onError={e => (e.target.style.display = 'none')}
                />
                <span className="text-gray-900 font-semibold text-lg tracking-tight hidden sm:block">
                  Philbox Pharmaceuticals
                </span>
              </div>
              <p className="text-center md:text-left text-sm text-gray-500">
                &copy; {currentYear} Philbox Admin. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 font-medium">
            <Link
              to="/admin/settings"
              className="hover:text-[#1a365d] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/admin/settings"
              className="hover:text-[#1a365d] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/admin/settings"
              className="hover:text-[#1a365d] transition-colors"
            >
              Support Center
            </Link>
          </div>
          <p className="text-gray-400 text-xs flex items-center gap-1 mt-4 md:mt-0">
            Crafted with <FaHeart className="text-red-400 mx-1" /> for better
            healthcare management
          </p>
        </div>
      </div>
    </footer>
  );
}
