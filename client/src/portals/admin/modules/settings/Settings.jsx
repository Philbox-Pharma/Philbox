// src/portals/admin/modules/settings/Settings.jsx
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCog,
  FaLock,
  FaShieldAlt,
  FaEnvelope,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaBell,
  FaKey,
} from 'react-icons/fa';

import { profileService } from '../../../../core/api/admin/profile.service';

export default function Settings() {
  // Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  // 2FA State
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('adminData');
    return stored ? JSON.parse(stored) : null;
  });
  const [toggling2FA, setToggling2FA] = useState(false);
  const [twoFASuccess, setTwoFASuccess] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  // Handle Password Reset Request
  const handlePasswordReset = async e => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const response = await profileService.forgotPassword(resetEmail);
      if (response.status === 200 || response.success) {
        setResetSuccess('Password reset link has been sent to your email!');
        setResetEmail('');
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setResetError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send reset email'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Handle 2FA Toggle
  const toggle2FA = async () => {
    setToggling2FA(true);
    setTwoFAError('');
    setTwoFASuccess('');

    try {
      const newValue = !admin?.isTwoFactorEnabled;
      const response = await profileService.update2FASettings(newValue);

      if (response.status === 200 || response.success) {
        const updatedAdmin = { ...admin, isTwoFactorEnabled: newValue };
        setAdmin(updatedAdmin);
        localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
        setTwoFASuccess(
          `Two-Factor Authentication ${newValue ? 'enabled' : 'disabled'} successfully!`
        );
        setTimeout(() => setTwoFASuccess(''), 3000);
      }
    } catch (err) {
      console.error('2FA toggle error:', err);
      setTwoFAError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update 2FA settings'
      );
    } finally {
      setToggling2FA(false);
    }
  };

  const SettingsCard = ({
    Icon,
    title,
    description,
    children,
    color = 'blue',
  }) => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center shrink-0`}
        >
          <Icon className={`text-xl text-${color}-600`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </Motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCog className="text-[#1a365d]" />
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/profile"
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <FaUser className="text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Edit Profile</p>
            <p className="text-xs text-gray-500">Update your info</p>
          </div>
        </Link>

        <Link
          to="/admin/notifications"
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <FaBell className="text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Notifications</p>
            <p className="text-xs text-gray-500">View activity logs</p>
          </div>
        </Link>

        <Link
          to="/admin/roles-permissions"
          className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <FaShieldAlt className="text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Roles & Permissions</p>
            <p className="text-xs text-gray-500">Manage access control</p>
          </div>
        </Link>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Reset Card */}
        <SettingsCard
          Icon={FaLock}
          title="Change Password"
          description="Request a password reset link via email"
          color="red"
        >
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder={admin?.email || 'Enter your email'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send a password reset link to this email
              </p>
            </div>

            {resetSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <FaCheckCircle />
                {resetSuccess}
              </div>
            )}

            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <FaExclamationTriangle />
                {resetError}
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading || !resetEmail}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FaKey />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        </SettingsCard>

        {/* 2FA Card */}
        <SettingsCard
          Icon={FaShieldAlt}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          color="blue"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${admin?.isTwoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <div>
                  <p className="font-medium text-gray-800">
                    {admin?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {admin?.isTwoFactorEnabled
                      ? 'OTP required on login'
                      : 'Direct login without OTP'}
                  </p>
                </div>
              </div>

              <button
                onClick={toggle2FA}
                disabled={toggling2FA}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  admin?.isTwoFactorEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {toggling2FA ? (
                  <FaSpinner className="animate-spin" />
                ) : admin?.isTwoFactorEnabled ? (
                  'Disable'
                ) : (
                  'Enable'
                )}
              </button>
            </div>

            {twoFASuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <FaCheckCircle />
                {twoFASuccess}
              </div>
            )}

            {twoFAError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <FaExclamationTriangle />
                {twoFAError}
              </div>
            )}

            <div className="text-sm text-gray-500 space-y-2">
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Receive OTP on your registered email
              </p>
              <p className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Protect against unauthorized access
              </p>
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2">Security Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a strong, unique password with at least 8 characters</li>
          <li>• Enable Two-Factor Authentication for extra security</li>
          <li>• Never share your login credentials with anyone</li>
          <li>• Log out when using shared computers</li>
        </ul>
      </div>
    </div>
  );
}
