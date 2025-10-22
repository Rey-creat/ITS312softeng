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

      const role = res.data.user.role;
      if (role === "Admin") navigate("/AdminDashboard");
      else navigate("/dashboard");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Invalid email or password" });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      ></div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img src={logo} alt="Logo" className="mx-auto h-24 w-24 mb-2" />
            <h2 className="text-3xl font-bold text-gray-900">School Facilities</h2>
            <p className="mt-2 text-sm text-gray-600">Repair Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.general && <p className="text-red-600">{errors.general}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-md"
            >
              Sign In
            </button>
          </form>

          <div className="text-center">
            <p>
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-600">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
