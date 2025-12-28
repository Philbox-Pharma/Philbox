import { Link, useSearchParams } from 'react-router-dom';

export default function OAuthError() {
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get('message') || 'Something went wrong during sign in.';

    return (
        <div className="auth-wrapper">
            <div className="card-container">
                {/* Logo */}
                <img src="/vite.svg" alt="Logo" className="auth-logo" />

                {/* Title */}
                <h1 className="auth-title">Sign In Failed</h1>
                <p className="auth-subtitle">We couldn't complete your sign in</p>

                {/* Error Message */}
                <div className="alert-error">
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{errorMessage}</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 mt-6">
                    <Link to="/doctor/login" className="btn-primary block text-center">
                        Try Again
                    </Link>

                    <Link to="/doctor/register" className="btn-secondary block text-center">
                        Create New Account
                    </Link>
                </div>

                {/* Help Text */}
                <p className="text-center text-gray-500 text-sm mt-4">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    );
}
