import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

export default function CreateRequest() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const [formData, setFormData] = useState({
    date_filed: "",
    date_needed: "",
    type_of_concern: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // FORMAT: Month Day, Year
  const formatDatePretty = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${months[month - 1]} ${day}, ${year}`;
    }
    return dateString;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date_filed) newErrors.date_filed = "Date Filed is required.";
    if (!formData.date_needed) newErrors.date_needed = "Date Needed is required.";
    if (!formData.type_of_concern) newErrors.type_of_concern = "Type of Concern is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUser?.id) {
        navigate("/login");
        return;
      }
      const payload = {
        ...formData,
        user_id: currentUser.id,
        requested_by: currentUser.fullname,
      };
      await axios.post("http://localhost:5000/api/requests", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request submitted successfully!");
      navigate("/dashboard", { state: { refresh: true } });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      alert(`Failed to submit request: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar role={currentUser.role || "Teacher"} />
      </div>
      <div className="flex-1 ml-65 p-8 h-screen overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create New Request</h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-6 border border-gray-200">
            {/* DATE FILED */}
            <div>
              <label htmlFor="date_filed" className="block text-sm font-medium text-gray-700 mb-2">
                Date Filed <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_filed"
                name="date_filed"
                value={formData.date_filed}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                aria-describedby="date_filed_help"
              />
              {errors.date_filed && <p className="text-red-500 text-sm mt-1">{errors.date_filed}</p>}
              {formData.date_filed && (
                <p id="date_filed_help" className="text-sm text-gray-600 mt-2">
                  📅 Selected: <span className="font-semibold">{formatDatePretty(formData.date_filed)}</span>
                </p>
              )}
            </div>
            {/* DATE NEEDED */}
            <div>
              <label htmlFor="date_needed" className="block text-sm font-medium text-gray-700 mb-2">
                Date Needed <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_needed"
                name="date_needed"
                value={formData.date_needed}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                aria-describedby="date_needed_help"
              />
              {errors.date_needed && <p className="text-red-500 text-sm mt-1">{errors.date_needed}</p>}
              {formData.date_needed && (
                <p id="date_needed_help" className="text-sm text-gray-600 mt-2">
                  📅 Selected: <span className="font-semibold">{formatDatePretty(formData.date_needed)}</span>
                </p>
              )}
            </div>
            {/* TYPE OF CONCERN */}
            <div>
              <label htmlFor="type_of_concern" className="block text-sm font-medium text-gray-700 mb-2">
                Type of Concern <span className="text-red-500">*</span>
              </label>
              <select
                id="type_of_concern"
                name="type_of_concern"
                value={formData.type_of_concern}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="">-- Select Concern --</option>
                <option value="Repair">Repair</option>
                <option value="Construction">Construction</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              {errors.type_of_concern && <p className="text-red-500 text-sm mt-1">{errors.type_of_concern}</p>}
            </div>
            {/* DESCRIPTION */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                placeholder="Please provide a detailed description of your request, including any relevant details or urgency."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            {/* SUBMIT BUTTON */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-md shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition duration-200"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
