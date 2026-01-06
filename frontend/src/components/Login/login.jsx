import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImg from "../images/background.jpg";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Debug: print role value
      console.log("User role after login:", res.data.user.role);

      const role = res.data.user.role;
      console.log("[DEBUG] User role after login:", role);
      // Department head roles (new values)
      const deptHeadRoles = [
        "DeptHead-IBED",
        "DeptHead-SARFAID",
        "DeptHead-SSLATE",
        "DeptHead-SHTM",
        "DeptHead-SBIT"
      ];
      // Normalize role for comparison
      const normalizedRole = (role || "").replace(/\s+/g, "").toLowerCase();
      if (deptHeadRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
        // Store department for DeptHeadPage
        if (res.data.user.department) {
          localStorage.setItem("department", res.data.user.department);
        }
        navigate("/DeptHeadPage");
      } else if (["ppgshead", "ppgs head"].includes(normalizedRole)) {
        navigate("/PPGSHeadPage");
      } else if (normalizedRole === "president") {
        navigate("/President");
      } else if (normalizedRole === "admin") {
        navigate("/AdminDashboard");
      } else if (normalizedRole === "superadmin") {
        navigate("/superadmin");
      } else if (normalizedRole === "personnel") {
        navigate("/PersonnelDashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-linear-to-br from-gray-50 to-blue-50">
      
      {/* LEFT SIDE IMAGE - Clean Version */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImg})` }}
        />
        <div className="relative z-10 flex flex-col justify-center items-center px-12 w-full">
          {/* Left panel content removed as requested */}
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              School Facilities
            </h2>
            <p className="text-gray-600 text-sm">Repair Management System</p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Alert */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium text-center">{errors.general}</p>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pl-10 pr-4 py-3 rounded-xl text-sm transition duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pl-10 pr-12 py-3 rounded-xl text-sm transition duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                    />
                    <div className="w-5 h-5 border border-gray-300 rounded-md peer-checked:border-blue-600 peer-checked:bg-blue-600 transition duration-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 select-none">Remember me</span>
                </label>
              </div>

              {/* SIGN IN BUTTON */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            {/* REGISTER LINK */}
            <div className="text-center pt-6 border-t border-gray-100 mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition duration-200"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} School Facilities Repair Management System. All rights reserved.
            </p>
            <div className="mt-2 flex justify-center space-x-4">
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
                Terms of Service
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/contact" className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}