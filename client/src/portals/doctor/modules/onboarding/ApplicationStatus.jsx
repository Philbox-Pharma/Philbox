import { Link } from 'react-router-dom';
import { FaClock, FaCheckCircle } from 'react-icons/fa';

export default function ApplicationStatus() {
  return (
    <div className="auth-wrapper">
      <div className="card-container w-[450px]!">
        {/* Logo */}
        <img src="/vite.svg" alt="Logo" className="auth-logo" />

        {/* Title */}
        <h1 className="auth-title">Application Under Review</h1>

        {/* Status Icon */}
        <div className="flex justify-center my-6">
          <div className="relative">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaClock className="text-4xl text-yellow-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-white text-sm" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Your documents have been submitted successfully.
          </p>
          <p className="text-gray-600 mt-2">
            Our team is reviewing your application. This usually takes
            <strong className="text-blue-600"> 24-48 hours</strong>.
          </p>
        </div>

        {/* Info Box */}
        <div className="alert-info">
          <p className="font-medium">What happens next?</p>
          <ul className="text-sm mt-2 list-disc list-inside space-y-1">
            <li>Admin will verify your documents</li>
            <li>You'll receive an email notification</li>
            <li>Once approved, complete your profile</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Check Status
          </button>

          <Link to="/doctor/login" className="btn-link block text-center">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
