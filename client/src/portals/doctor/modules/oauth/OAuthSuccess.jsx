import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthSuccess = () => {
      try {
        const nextStep = searchParams.get('nextStep');
        const isNewUser = searchParams.get('isNewUser') === 'true';

        // Handle navigation based on nextStep
        switch (nextStep) {
          case 'dashboard':
            navigate('/doctor/dashboard', { replace: true });
            break;
          case 'submit-application':
            navigate('/doctor/submit-application', { replace: true });
            break;
          case 'waiting-approval':
            navigate('/doctor/application-status', { replace: true });
            break;
          case 'resubmit-application':
            navigate('/doctor/submit-application', {
              state: { resubmit: true },
              replace: true,
            });
            break;
          case 'complete-profile':
            navigate('/doctor/complete-profile', { replace: true });
            break;
          default:
            // New user - start onboarding
            if (isNewUser) {
              navigate('/doctor/submit-application', { replace: true });
            } else {
              navigate('/doctor/dashboard', { replace: true });
            }
        }
      } catch {
        setError('Authentication failed. Please try again.');
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
        {!error && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Completing Sign In...
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we set up your account.
            </p>
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
              onClick={() => navigate('/doctor/login')}
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
