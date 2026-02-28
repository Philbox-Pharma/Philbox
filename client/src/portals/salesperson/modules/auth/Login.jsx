import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { salespersonAuthApi } from '../../../../core/api/salesperson/auth.service';

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
      await salespersonAuthApi.login(email, password);
      navigate('/salesperson/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card-container">
        {/* Logo */}
        <img src="/vite.svg" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">Salesperson Login</h1>
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
              placeholder="salesperson@example.com"
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
            <Link to="/salesperson/forgot-password" className="btn-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Info Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Account created by admin. Contact admin if you need access.
        </p>
      </div>
    </div>
  );
}
