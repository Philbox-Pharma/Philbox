import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { adminAuthApi } from "../../../../../core/api/admin/auth";

const CredentialsForm = ({ onOtpSent, onForgotPassword }) => {
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
      // API Call: Step 1
      await adminAuthApi.login(email, password);
      // If successful, pass email to parent to handle state switch
      onOtpSent(email);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium">Email Address</label>
        <input
          type="email"
          required
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@philbox.com"
        />
      </div>

      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-medium">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          required
          className="input-field pr-10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <span
          className="absolute right-3 top-9 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="text-right mb-4">
        <button type="button" onClick={onForgotPassword} className="link-text">
          Forgot password?
        </button>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Verifying..." : "Sign In"}
      </button>
    </form>
  );
};

export default CredentialsForm;
