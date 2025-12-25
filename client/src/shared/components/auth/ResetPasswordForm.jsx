import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPasswordForm({
    onSubmit,           // API call function
    loginPath,          // Redirect path
    title = 'Reset Password',
    subtitle = 'Enter your new password',
    minPasswordLength = 8
}) {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation: Passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validation: Minimum length
        if (newPassword.length < minPasswordLength) {
            setError(`Password must be at least ${minPasswordLength} characters`);
            return;
        }

        setLoading(true);

        try {
            await onSubmit(token, newPassword);
            setSuccess(true);

            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate(loginPath);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
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
                <h1 className="auth-title">{title}</h1>
                <p className="auth-subtitle">
                    {success ? 'Password reset successful!' : subtitle}
                </p>

                {/* Success State */}
                {success ? (
                    <div>
                        <div className="alert-success">
                            <p className="font-medium">Password Changed!</p>
                            <p className="text-sm mt-1">Redirecting to login page...</p>
                        </div>

                        <Link to={loginPath} className="btn-primary block text-center mt-4">
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    /* Form State */
                    <form onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="alert-error mb-4">
                                {error}
                            </div>
                        )}

                        {/* New Password */}
                        <div className="mb-4 relative">
                            <label htmlFor="newPassword" className="input-label">
                                New Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field pr-10"
                                placeholder="Enter new password"
                                required
                            />
                            <span
                                className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4 relative">
                            <label htmlFor="confirmPassword" className="input-label">
                                Confirm Password
                            </label>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pr-10"
                                placeholder="Confirm new password"
                                required
                            />
                            <span
                                className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        {/* Password Requirement */}
                        <p className="text-xs text-gray-500 mb-4">
                            Password must be at least {minPasswordLength} characters
                        </p>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        {/* Back to Login */}
                        <div className="text-center mt-4">
                            <Link to={loginPath} className="btn-link">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
