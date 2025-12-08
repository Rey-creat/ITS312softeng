import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await axios.post(`http://localhost:5000/api/reset-password/${token}`, { password });
      setStatus("Password reset successful. You can now log in.");
    } catch (err) {
      setStatus("Error resetting password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">New Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg border border-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {status && <p className="mt-4 text-sm text-green-600">{status}</p>}
        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
