import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function VerifyEmail({
    onVerify,           // API call function
    loginPath,          // Redirect path
    title = 'Email Verification'
}) {
    const { token } = useParams();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Invalid verification link. Token missing.');
                setLoading(false);
                return;
            }

            try {
                await onVerify(token);
                setSuccess(true);
            } catch (err) {
                setError(err.response?.data?.message || 'Verification failed. Link may be expired.');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, onVerify]);

    return (
        <div className="auth-wrapper">
            <div className="card-container">
                {/* Logo */}
                <img src="/vite.svg" alt="Logo" className="auth-logo" />

                {/* Title */}
                <h1 className="auth-title">{title}</h1>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Verifying your email...</p>
                    </div>
                )}

                {/* Success State */}
                {!loading && success && (
                    <div>
                        <div className="alert-success">
                            <p className="font-medium">✓ Email Verified Successfully!</p>
                            <p className="text-sm mt-1">
                                Your account is now active. You can login now.
                            </p>
                        </div>

                        <Link to={loginPath} className="btn-primary block text-center mt-4">
                            Go to Login
                        </Link>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div>
                        <div className="alert-error">
                            <p className="font-medium">Verification Failed</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>

                        <Link to={loginPath} className="btn-secondary block text-center mt-4">
                            Go to Login
                        </Link>

                        <p className="text-center text-gray-500 text-sm mt-4">
                            Need a new verification link?{' '}
                            <Link to="/register" className="btn-link">
                                Register Again
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
