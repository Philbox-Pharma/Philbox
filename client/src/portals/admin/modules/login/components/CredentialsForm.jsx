import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { adminAuthApi } from "../../../../../core/api/admin/auth";

const CredentialsForm = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminAuthApi.login(email, password);
      onOtpSent(email);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Email Field */}
      <div className="mb-4">
        <label className="input-label">Email Address</label>
        <input
          type="email"
          required
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@philbox.com"
        />
      </div>

      {/* Password Field */}
      <div className="mb-4 relative">
        <label className="input-label">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          required
          className="input-field pr-10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <span
          className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* Forgot Password Link - Sirf ek baar */}
      <div className="text-right mb-4">
        <Link to="/admin/forgot-password" className="btn-link">
          Forgot Password?
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert-error mb-4">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Verifying..." : "Sign In"}
      </button>
    </form>
  );
};

export default CredentialsForm;
