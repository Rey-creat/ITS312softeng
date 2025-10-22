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
      <div className="hidden lg:flex w-1/2 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImg})` }} />

      <div className="flex w-full lg:w-1/2 items-start justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 mt-12">
          <div className="text-center">
            <img src={logo} alt="Logo" className="mx-auto h-30 w-30 mb-2" />
            <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && <div className="text-red-600">{errors.general}</div>}

            <input
              name="fullname"
              placeholder="Fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.fullname && <p className="text-red-500">{errors.fullname}</p>}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.password && <p className="text-red-500">{errors.password}</p>}

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Choose role --</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
            </select>
            {errors.role && <p className="text-red-500">{errors.role}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-blue-600">
                Have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
