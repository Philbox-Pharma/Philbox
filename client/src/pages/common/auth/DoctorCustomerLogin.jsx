import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../../components/layout/AuthLayout';
import Button from '../../../components/common/Button';
import useAuthStore from '../../../stores/auth.store';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
  });

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const result = await login(
      { email: formData.email, password: formData.password },
      formData.role
    );

    if (result.success) {
      const dashboardRoute =
        formData.role === 'doctor'
          ? '/doctor/dashboard'
          : '/customer/dashboard';
      navigate(dashboardRoute);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a
          </label>
          <div className="flex gap-4">
            <label className="flex-1">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === 'customer'}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="cursor-pointer border-2 border-gray-300 rounded-lg p-3 text-center peer-checked:border-[#003399] peer-checked:bg-[#003399]/5 transition">
                <span className="font-medium text-gray-700">Customer</span>
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="role"
                value="doctor"
                checked={formData.role === 'doctor'}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="cursor-pointer border-2 border-gray-300 rounded-lg p-3 text-center peer-checked:border-[#003399] peer-checked:bg-[#003399]/5 transition">
                <span className="font-medium text-gray-700">Doctor</span>
              </div>
            </label>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition"
            placeholder="Enter your password"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          label={loading ? 'Signing in...' : 'Sign In'}
          disabled={loading}
          variant="gradient"
          fullWidth
        />
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => navigate(`/${formData.role}/signup`)}
            className="text-[#003399] font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
