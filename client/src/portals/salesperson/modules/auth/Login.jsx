import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../../../shared/context/AuthContext';
import { salespersonAuthApi } from '../../../../core/api/salesperson/auth';

export default function Login() {
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await salespersonAuthApi.login(email, password);
            
            // Extract data correctly from sendResponse structure
            const userData = response.data?.salesperson || response.salesperson;
            const nextStep = response.data?.nextStep || response.nextStep;
            const isTwoFactorEnabled = response.data?.isTwoFactorEnabled || response.isTwoFactorEnabled;

            if (isTwoFactorEnabled || nextStep === 'verify-otp') {
                // If 2FA is needed, the verify-otp page is not implemented for salespeople yet
                setError('Two-factor authentication is required, but the verification page is not yet implemented.');
                return;
            }

            loginSuccess({ ...userData, role: 'salesperson' });
            navigate('/salesperson/dashboard', { replace: true });
        } catch (err) {
            console.error('Login Error:', err);
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card-container">
                {/* Logo */}
                <img src="/Philbox.PNG" alt="Logo" className="auth-logo" />

                {/* Title */}
                <h1 className="auth-title">Salesperson Login</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    {/* Error Message */}
                    {error && (
                        <div className="alert-error mb-4">
                            {error}
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
                            onChange={(e) => setEmail(e.target.value)}
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
                            onChange={(e) => setPassword(e.target.value)}
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
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
