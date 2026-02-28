import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { customerAuthApi } from '../../../../core/api/customer/auth';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await customerAuthApi.login(email, password);

      const customer = response.data?.customer;

      // Address check - Critical logic
      if (!customer?.address_id) {
        // No address - redirect to complete profile
        navigate('/profile/edit');
      } else {
        // Address exists - redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';

      // Check if email not verified
      if (message.toLowerCase().includes('verify')) {
        setError('Please verify your email first. Check your inbox.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleLogin = () => {
    window.location.href = customerAuthApi.getGoogleAuthUrl();
  };

  return (
    <div className="auth-wrapper">
      <div className="card-container">
        {/* Logo */}
        <img
          src="/Philbox.PNG"
          alt="Philbox"
          className="auth-logo h-12 w-auto mx-auto mb-6 object-contain"
        />

        {/* Title */}
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && <div className="alert-error mb-4">{error}</div>}

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
              placeholder="john@example.com"
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
            <Link to="/forgot-password" className="btn-link">
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
          <Link to="/register" className="btn-link">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
