import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImg from "../images/background.jpg";
import logo from "../images/logo.png";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // If role does not require department, send department as null if empty
      const payload = { ...formData };
      if ((formData.role === "PPGSHead" || formData.role === "President") && (!formData.department || formData.department === "")) {
        payload.department = null;
      }
      const res = await axios.post("http://localhost:5000/api/register", payload);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* LEFT SIDE IMAGE (same as Login) */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      ></div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-4">
            <img src={logo} className="mx-auto h-20 w-20" alt="Logo" />
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              Create your account
            </h2>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-center text-sm mb-2">{error}</p>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* FULL NAME */}
            <div>
              <label className="font-medium text-sm">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="font-medium text-sm">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="font-medium text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="font-medium text-sm">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
            </div>

            {/* ROLE DROPDOWN */}
            <div>
              <label className="font-medium text-sm">Select Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              >
                <option value="">-- Choose Role --</option>
                <option value="DeptHead">Department Head</option>
                <option value="PPGSHead">Head of PPGS</option>
                <option value="President">School President</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            {/* DEPARTMENT DROPDOWN */}
            <div>
              <label className="font-medium text-sm">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md text-sm"
                required={!(formData.role === "PPGSHead" || formData.role === "President")}
              >
                <option value="">-- Choose Department --</option>
                <option value="SARFAID">SARFAID</option>
                <option value="SSLATE">SSLATE</option>
                <option value="SHTM">SHTM</option>
                <option value="SBIT">SBIT</option>
              </select>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-md text-sm"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
