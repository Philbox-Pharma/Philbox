import { useState, useEffect } from "react";
import { adminAuthApi } from "../../../../../core/api/admin/auth";
import { useAuth } from "../../../../../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";

const OtpForm = ({ email, onBack }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // API Call: Step 2
      const response = await adminAuthApi.verifyOtp(email, otp);
      // Update Context
      loginSuccess(response.data.admin);
      // Redirect
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold mb-2">Two-Factor Authentication</h2>
      <p className="text-gray-500 text-sm mb-4">
        Enter the 6-digit code sent to <br /> <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            maxLength="6"
            className="input-field text-center text-2xl tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button type="submit" className="btn-primary mb-3" disabled={loading || otp.length < 6}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <button onClick={onBack} className="text-gray-400 text-sm hover:text-gray-600">
        Back to Login
      </button>
    </div>
  );
};

export default OtpForm;
