import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { customerAuthApi } from '../../../../core/api/customer/auth';

export default function Register() {
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
  const [errors, setErrors] = useState({}); // Per-field errors
  const [generalError, setGeneralError] = useState(''); // General error message
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;

    // Only allow digits for contact number
    if (name === 'contactNumber') {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (generalError) setGeneralError('');
  };

  // Frontend validation aligned with backend DTO
  const validateForm = () => {
    const newErrors = {};

    // fullName: required, min 3, max 50
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full Name must be at most 50 characters';
    }

    // email: required, valid email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // password: required, alphanumeric, 3-30 chars (matching backend regex)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!/^[a-zA-Z0-9]{3,30}$/.test(formData.password)) {
      newErrors.password = 'Password must be 3-30 characters, letters and numbers only';
    }

    // confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // contactNumber: optional, but if provided must be exactly 11 digits
    if (formData.contactNumber) {
      if (!/^[0-9]+$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Contact number must contain digits only';
      } else if (formData.contactNumber.length !== 11) {
        newErrors.contactNumber = 'Contact number must be exactly 11 digits';
      }
    }

    // gender: optional, but if selected must be Male or Female
    if (formData.gender && !['Male', 'Female'].includes(formData.gender)) {
      newErrors.gender = 'Please select Male or Female';
    }

    // dateOfBirth: optional, but if provided must be a valid past date
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      } else if (dob >= new Date()) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setGeneralError('');

    // Run frontend validation
    if (!validateForm()) return;

    setLoading(true);

    // Build payload matching backend DTO (DO NOT send confirmPassword)
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    // Only include optional fields if they have a value
    if (formData.contactNumber) payload.contactNumber = formData.contactNumber;
    if (formData.gender) payload.gender = formData.gender;
    if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;

    try {
      await customerAuthApi.register(payload);
      setSuccess(true);
    } catch (err) {
      // Handle backend validation errors (array of messages)
      const responseData = err.response?.data;
      if (responseData) {
        // If backend returns error details as an array
        if (Array.isArray(responseData.error)) {
          // Try to map errors to fields
          const fieldErrors = {};
          const unmappedErrors = [];

          responseData.error.forEach(msg => {
            const lower = msg.toLowerCase();
            if (lower.includes('fullname') || lower.includes('"fullname"')) {
              fieldErrors.fullName = msg.replace(/"/g, '');
            } else if (lower.includes('email')) {
              fieldErrors.email = msg.replace(/"/g, '');
            } else if (lower.includes('password')) {
              fieldErrors.password = msg.replace(/"/g, '');
            } else if (lower.includes('contactnumber') || lower.includes('contact')) {
              fieldErrors.contactNumber = msg.replace(/"/g, '');
            } else if (lower.includes('gender')) {
              fieldErrors.gender = msg.replace(/"/g, '');
            } else if (lower.includes('dateofbirth') || lower.includes('date')) {
              fieldErrors.dateOfBirth = msg.replace(/"/g, '');
            } else {
              unmappedErrors.push(msg.replace(/"/g, ''));
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
          if (unmappedErrors.length > 0) {
            setGeneralError(unmappedErrors.join('. '));
          } else if (Object.keys(fieldErrors).length === 0) {
            setGeneralError(responseData.message || 'Registration failed');
          }
        } else {
          // Single message string
          const msg = responseData.message || 'Registration failed';
          if (msg.toLowerCase().includes('email already exists')) {
            setErrors({ email: msg });
          } else {
            setGeneralError(msg);
          }
        }
      } else {
        setGeneralError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSignup = () => {
    window.location.href = customerAuthApi.getGoogleAuthUrl();
  };

  // Input error styling — use inline style since @apply border in .input-field can override Tailwind classes
  const inputStyle = (fieldName) =>
    errors[fieldName] ? { borderColor: '#f87171', boxShadow: '0 0 0 2px rgba(248, 113, 113, 0.2)' } : {};

  return (
    <div className="auth-wrapper">
      <div className="card-container !w-[450px]">
        {/* Logo */}
        <img
          src="/Philbox.PNG"
          alt="Philbox"
          className="auth-logo h-12 w-auto mx-auto mb-6 object-contain"
        />

        {/* Title */}
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          {success
            ? 'Check your email to verify account'
            : 'Join PhilBox today'}
        </p>

        {/* Success State */}
        {success ? (
          <div>
            <div className="alert-success">
              <div className="flex items-center gap-2 mb-1">
                <FaCheckCircle className="text-green-500" />
                <p className="font-medium">Registration Successful!</p>
              </div>
              <p className="text-sm mt-1">
                We&apos;ve sent a verification link to{' '}
                <strong>{formData.email}</strong>
              </p>
              <p className="text-sm mt-1">
                Please check your email and click the link to verify your
                account.
              </p>
            </div>

            <Link to="/login" className="btn-primary block text-center mt-4">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Registration Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* General Error Message */}
              {generalError && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="fullName" className="input-label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  style={inputStyle('fullName')}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle size={10} />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="input-label">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  style={inputStyle('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle size={10} />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password & Confirm Password - Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="input-label">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pr-10"
                      style={inputStyle('password')}
                      placeholder="••••••••"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle size={10} />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="input-label">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pr-10"
                      style={inputStyle('confirmPassword')}
                      placeholder="••••••••"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle size={10} />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password hint */}
              <p className="text-xs text-gray-400 -mt-2 mb-4">
                3-30 characters, letters and numbers only
              </p>

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
                  style={inputStyle('contactNumber')}
                  placeholder="03XXXXXXXXX"
                  maxLength={11}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle size={10} />
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Gender & Date of Birth - Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                    style={inputStyle('gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle size={10} />
                      {errors.gender}
                    </p>
                  )}
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
                    style={inputStyle('dateOfBirth')}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle size={10} />
                      {errors.dateOfBirth}
                    </p>
                  )}
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
              <Link to="/login" className="btn-link">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
