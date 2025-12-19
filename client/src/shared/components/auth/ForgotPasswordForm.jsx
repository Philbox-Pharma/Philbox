import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordForm({
    onSubmit,           // API call function
    loginPath,          // Redirect path (e.g., '/login' or '/admin/login')
    title = 'Forgot Password',
    subtitle = 'Enter your email to reset password'
}) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSubmit(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                    {success ? 'Check your email for reset link' : subtitle}
                </p>

                {/* Success State */}
                {success ? (
                    <div>
                        <div className="alert-success">
                            <p className="font-medium">Email Sent!</p>
                            <p className="text-sm mt-1">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>

                        <Link to={loginPath} className="btn-primary block text-center mt-4">
                            Back to Login
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

                        {/* Email Input */}
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
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        {/* Back to Login Link */}
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
