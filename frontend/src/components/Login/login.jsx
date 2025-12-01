import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImg from "../images/background.jpg";
import logo from "../images/logo.png";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Debug: print role value
      console.log("User role after login:", res.data.user.role);

      const role = res.data.user.role;
      if (role === "DeptHead") {
        navigate("/DeptHeadPage");
      } else if (role === "PPGSHead") {
        navigate("/PPGSHeadPage");
      } else if (role === "President") {
        navigate("/President");
      } else if (role === "Admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Invalid email or password",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT BACKGROUND IMAGE */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      ></div>

      {/* RIGHT LOGIN FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <img src={logo} alt="Logo" className="mx-auto h-24 w-24 mb-3" />
            <h2 className="text-3xl font-bold text-gray-900">School Facilities</h2>
            <p className="mt-1 text-sm text-gray-600">Repair Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" className="h-4 w-4" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>

            {/* ERROR */}
            {errors.general && (
              <p className="text-red-600 text-sm">{errors.general}</p>
            )}

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>

          {/* REGISTER */}
          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
