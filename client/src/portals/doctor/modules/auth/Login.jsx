import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../../../shared/context/AuthContext';
import { doctorAuthApi } from '../../../../core/api/doctor/auth';

export default function Login() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState({ text: '', type: '' });
  const [error, setError] = useState('');

  // Handle nextStep navigation
  const handleNextStep = nextStep => {
    switch (nextStep) {
      case 'dashboard':
        navigate('/doctor/dashboard');
        break;
      case 'submit-application':
        navigate('/doctor/submit-application');
        break;
      case 'waiting-approval':
        navigate('/doctor/application-status');
        break;
      case 'resubmit-application':
        navigate('/doctor/submit-application', { state: { resubmit: true } });
        break;
      case 'complete-profile':
        navigate('/doctor/complete-profile');
        break;
      default:
        navigate('/doctor/dashboard');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setResendMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const response = await doctorAuthApi.login(email, password);

      const doctorData = response.data?.doctor || response.doctor;
      const nextStep = response.data?.nextStep || response.nextStep;

      // Save user data to auth context
      loginSuccess(doctorData);

      // Handle navigation based on nextStep
      handleNextStep(nextStep);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';

      // Check specific error cases
      if (message.toLowerCase().includes('verify')) {
        setError('Please verify your email first. Check your inbox.');
      } else if (message.toLowerCase().includes('blocked')) {
        setError('Your account has been blocked. Please contact support.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setResendLoading(true);
    setResendMessage({ text: '', type: '' });

    try {
      const response = await doctorAuthApi.resendVerificationEmail(email);
      setResendMessage({
        text:
          response.message ||
          'Verification email resent! Please check your inbox.',
        type: 'success',
      });
      setError('');
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
  const handleGoogleLogin = () => {
    window.location.href = doctorAuthApi.getGoogleAuthUrl();
  };

  return (
    <div className="auth-wrapper">
      <div className="card-container">
        {/* Logo */}
        <img src="/Philbox.PNG" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">Doctor Login</h1>
        <p className="auth-subtitle">Sign in to your doctor account</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="alert-error mb-4">
              {error}
              {error.toLowerCase().includes('verify') && (
                <button
                  type="button"
                  onClick={handleResendLink}
                  disabled={resendLoading}
                  className="block mt-2 text-xs font-bold underline hover:no-underline disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}

          {/* Resend Success/Error Message */}
          {resendMessage.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                resendMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {resendMessage.text}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="doctor@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field pr-10"
              placeholder="••••••••"
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-4">
            <Link to="/doctor/forgot-password" className="btn-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Register Link */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/doctor/register" className="btn-link">
            Register as Doctor
          </Link>
        </p>
      </div>
    </div>
  );
}
