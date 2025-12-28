import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';

export default function Register() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    gender: '',
    dateOfBirth: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form validation
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (
      formData.contactNumber.length < 10 ||
      formData.contactNumber.length > 15
    ) {
      setError('Contact number must be 10-15 digits');
      return false;
    }
    return true;
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword: _confirmPassword, ...dataToSend } = formData;

      const response = await doctorAuthApi.register(dataToSend);

      if (response.data?.nextStep === 'verify-email') {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSignup = () => {
    window.location.href = doctorAuthApi.getGoogleAuthUrl();
  };

  return (
    <div className="auth-wrapper">
      <div className="card-container !w-[480px]">
        {/* Logo */}
        <img src="/vite.svg" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">Doctor Registration</h1>
        <p className="auth-subtitle">
          {success
            ? 'Check your email to verify account'
            : 'Join PhilBox as a Healthcare Provider'}
        </p>

        {/* Success State */}
        {success ? (
          <div>
            <div className="alert-success">
              <p className="font-medium">Registration Successful!</p>
              <p className="text-sm mt-1">
                We've sent a verification link to{' '}
                <strong>{formData.email}</strong>
              </p>
              <p className="text-sm mt-1">
                Please verify your email to continue with the application
                process.
              </p>
            </div>

            <Link
              to="/doctor/login"
              className="btn-primary block text-center mt-4"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && <div className="alert-error mb-4">{error}</div>}

              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="fullName" className="input-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="input-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="doctor@example.com"
                  required
                />
              </div>

              {/* Password & Confirm Password - Side by Side */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Password */}
                <div className="relative">
                  <label htmlFor="password" className="input-label">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <span
                    className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </span>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label htmlFor="confirmPassword" className="input-label">
                    Confirm Password
                  </label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <span
                    className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </span>
                </div>
              </div>

              {/* Contact Number */}
              <div className="mb-4">
                <label htmlFor="contactNumber" className="input-label">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1234567890"
                  required
                />
              </div>

              {/* Gender & Date of Birth - Side by Side */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="input-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="input-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="px-3 text-gray-500 text-sm">or</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/doctor/login" className="btn-link">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
