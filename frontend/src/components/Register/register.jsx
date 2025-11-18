import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImg from "../images/background.jpg";
import logo from "../images/logo.png";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "", role: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { fullname, email, password, role } = formData;
    const newErrors = {};
    if (!fullname) newErrors.fullname = "Fullname required";
    if (!email) newErrors.email = "Email required";
    if (!password) newErrors.password = "Password required";
    if (!role) newErrors.role = "Role required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/register", formData);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left background - Same as Login.jsx */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      ></div>

      {/* Right form container - Same as Login.jsx */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and heading - Adjusted to match the style and size of Login.jsx */}
          <div className="text-center">
            {/* Logo size: h-24 w-24 mb-2 from Login.jsx */}
            <img src={logo} alt="Logo" className="mx-auto h-24 w-24 mb-2" /> 
            {/* Title font: text-3xl font-bold text-gray-900 from Login.jsx */}
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2> 
            {/* Subtitle font: mt-2 text-sm text-gray-600 from Login.jsx */}
            <p className="mt-2 text-sm text-gray-600">Register for the Repair Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {errors.general && <div className="text-red-600">{errors.general}</div>}

            {/* Input fields - Adjusted classNames to match Login.jsx style */}
            <input
              name="fullname"
              placeholder="Fullname"
              value={formData.fullname}
              onChange={handleChange}
              // Added border-md for consistent style
              className="w-full px-3 py-2 border rounded-md" 
              required
            />
            {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">-- Choose role --</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}

            {/* Submit button - Adjusted classNames to match Login.jsx style */}
            <button
              type="submit"
              disabled={loading}
              // Used the exact button classes from Login.jsx
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-md" 
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>

            {/* Link to Login - Adjusted style to match Login.jsx */}
            <div className="text-center">
              <p>
                Have an account?{" "}
                <Link to="/login" className="text-blue-600">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}