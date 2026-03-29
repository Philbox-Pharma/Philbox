import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
} from 'react-icons/fa';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: FaUser },
  { id: 2, title: 'Security', icon: FaLock },
  { id: 3, title: 'Complete', icon: FaCheckCircle },
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState({ text: '', type: '' });
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (error) setError('');
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (
      !/^(\+92|92|0)(3\d{2})[- ]?\d{7}$/.test(formData.contactNumber.trim())
    ) {
      errors.contactNumber =
        'Please provide a valid Pakistan contact number (e.g. 03001234567)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.gender) {
      errors.gender = 'Please select your gender';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Go to next step
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setError('');
    }
  };

  // Go to previous step
  const handlePrev = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setError('');
      setFieldErrors({});
    }
  };

  // Handle form submit on Step 2
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) return;

    setLoading(true);

    try {
      const { confirmPassword: _confirmPassword, ...dataToSend } = formData;
      const response = await doctorAuthApi.register(dataToSend);

      if (response.data?.nextStep === 'verify-email' || response.nextStep === 'verify-email') {
        setSuccess(true);
        setCurrentStep(3);
      }
    } catch (err) {
      const serverError = err.response?.data;
      if (
        serverError?.message === 'Validation error' &&
        Array.isArray(serverError.error)
      ) {
        // Map backend field names to friendly names for better display
        const friendlyErrors = serverError.error.map(msg => {
            return msg.replace(/"/g, '')
                      .replace('fullName', 'Full Name')
                      .replace('contactNumber', 'Contact Number')
                      .replace('dateOfBirth', 'Date of Birth')
                      .replace('password', 'Password');
        });
        setError(friendlyErrors.join('. '));
      } else if (serverError?.message === 'Email already exists') {
        setError('This email is already registered. If you forgot your password or didn\'t get a verification email, please contact support as the resend feature is pending.');
      } else {
        setError(
          serverError?.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setResendLoading(true);
    setResendMessage({ text: '', type: '' });

    try {
      const response = await doctorAuthApi.resendVerificationEmail(formData.email);
      setResendMessage({
        text:
          response.message ||
          'Verification email resent! Please check your inbox.',
        type: 'success',
      });
    } catch (err) {
      setResendMessage({
        text:
          err.response?.data?.message ||
          'Failed to resend email. Please try again.',
        type: 'error',
      });
    } finally {
      setResendLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSignup = () => {
    window.location.href = doctorAuthApi.getGoogleAuthUrl();
  };

  // Step Progress Bar
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                  ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200'
                      : isActive
                        ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? <FaCheckCircle size={16} /> : <Icon size={14} />}
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                  isActive
                    ? 'text-blue-600'
                    : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                  currentStep > step.id ? 'bg-green-400' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Step 1: Personal Information
  const renderStep1 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <FaUser className="text-blue-500" />
        Personal Information
      </h2>

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
          className={`input-field ${fieldErrors.fullName ? 'border-red-400 focus:ring-red-300' : ''}`}
          placeholder="Dr. John Doe"
        />
        {fieldErrors.fullName && (
          <p className="input-error">{fieldErrors.fullName}</p>
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
          className={`input-field ${fieldErrors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
          placeholder="doctor@example.com"
        />
        {fieldErrors.email && (
          <p className="input-error">{fieldErrors.email}</p>
        )}
      </div>

      {/* Contact Number */}
      <div className="mb-6">
        <label htmlFor="contactNumber" className="input-label">
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="contactNumber"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          className={`input-field ${fieldErrors.contactNumber ? 'border-red-400 focus:ring-red-300' : ''}`}
          placeholder="+923001234567"
        />
        {fieldErrors.contactNumber && (
          <p className="input-error">{fieldErrors.contactNumber}</p>
        )}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        className="btn-primary flex items-center justify-center gap-2"
      >
        Continue <FaArrowRight size={14} />
      </button>
    </div>
  );

  // Step 2: Security & Identity
  const renderStep2 = () => (
    <div className="animate-fadeIn">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <FaLock className="text-blue-500" />
        Account Security
      </h2>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="input-label">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`input-field pr-10 ${fieldErrors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
            placeholder="••••••••"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </span>
          {fieldErrors.password && (
            <p className="input-error">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="input-label">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`input-field pr-10 ${fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-300' : ''}`}
            placeholder="••••••••"
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
          {fieldErrors.confirmPassword && (
            <p className="input-error">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Gender & Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Gender */}
        <div>
          <label htmlFor="gender" className="input-label">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`input-field ${fieldErrors.gender ? 'border-red-400 focus:ring-red-300' : ''}`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {fieldErrors.gender && (
            <p className="input-error">{fieldErrors.gender}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="input-label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`input-field ${fieldErrors.dateOfBirth ? 'border-red-400 focus:ring-red-300' : ''}`}
          />
          {fieldErrors.dateOfBirth && (
            <p className="input-error">{fieldErrors.dateOfBirth}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="btn-secondary flex items-center justify-center gap-2 !w-auto px-6"
        >
          <FaArrowLeft size={14} /> Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );

  // Step 3: Success
  const renderStep3 = () => (
    <div className="animate-fadeIn text-center">
      {/* Success Animation */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
          <FaCheckCircle className="text-4xl text-green-500" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Registration Successful! 🎉
      </h2>

      <div className="alert-success text-left">
        <p className="font-medium">Check your email!</p>
        <p className="text-sm mt-1">
          We&apos;ve sent a verification link to{' '}
          <strong>{formData.email}</strong>
        </p>
        <p className="text-sm mt-1">
          Please verify your email to continue with the application process.
        </p>

        <button
          type="button"
          onClick={handleResendLink}
          disabled={resendLoading}
          className="mt-3 text-sm font-bold underline hover:no-underline disabled:opacity-50 text-green-700"
        >
          {resendLoading ? 'Sending...' : "Didn't get email? Resend"}
        </button>
      </div>

      {/* Resend Status Message */}
      {resendMessage.text && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            resendMessage.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {resendMessage.text}
        </div>
      )}

      {/* What's Next Info */}
      <div className="alert-info text-left mt-4">
        <p className="font-medium">What happens next?</p>
        <ol className="text-sm mt-2 list-decimal list-inside space-y-1">
          <li>Verify your email via the link sent</li>
          <li>Login to your account</li>
          <li>Upload your documents for verification</li>
          <li>Admin will review and approve your application</li>
          <li>Complete your professional profile</li>
        </ol>
      </div>

      <Link to="/doctor/login" className="btn-primary block text-center mt-6">
        Go to Login
      </Link>
    </div>
  );

  return (
    <div className="auth-wrapper !py-8">
      <div className="card-container w-full !max-w-[520px]">
        {/* Logo */}
        <img src="/Philbox.PNG" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">Doctor Registration</h1>
        <p className="auth-subtitle">
          {currentStep === 3
            ? 'Your account has been created'
            : 'Join PhilBox as a Healthcare Provider'}
        </p>

        {/* Step Progress */}
        <StepIndicator />

        {/* Error Message */}
        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Form */}
        {currentStep < 3 ? (
          <>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
            </form>

            {/* Show Google & Login only on Step 1 */}
            {currentStep === 1 && (
              <>
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
          </>
        ) : (
          renderStep3()
        )}
      </div>
    </div>
  );
}
