import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerAuthApi } from '../../../../core/api/customer/auth';

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleOAuthSuccess = async () => {
            try {
                // Get URL params
                const role = searchParams.get('role');
                const isNewUser = searchParams.get('isNewUser') === 'true';

                // Verify role is customer
                if (role !== 'customer') {
                    setError('Invalid role. Please try again.');
                    setLoading(false);
                    return;
                }

                // Fetch current user data
                const response = await customerAuthApi.getMe();
                const customer = response.data?.customer || response.customer;

                // Address check - Critical logic
                if (!customer?.address_id || isNewUser) {
                    // No address or new user - redirect to complete profile
                    navigate('/profile/edit', { replace: true });
                } else {
                    // Address exists - redirect to dashboard
                    navigate('/dashboard', { replace: true });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Authentication failed. Please try again.');
                setLoading(false);
            }
        };

        handleOAuthSuccess();
    }, [navigate, searchParams]);

    return (
        <div className="auth-wrapper">
            <div className="card-container">
                {/* Logo */}
                <img src="/vite.svg" alt="Logo" className="auth-logo" />

                {/* Loading State */}
                {loading && !error && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <h2 className="text-xl font-semibold text-gray-800 mt-4">
                            Completing Sign In...
                        </h2>
                        <p className="text-gray-500 mt-2">Please wait while we set up your account.</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div>
                        <h1 className="auth-title">Sign In Failed</h1>

                        <div className="alert-error mt-4">
                            <p>{error}</p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary mt-4"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
