import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

export default function CreateRequest() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const [formData, setFormData] = useState({
    date_filed: todayStr,
    date_needed: "",
    type_of_concern: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

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
      setSuccessMsg("Request submitted successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/dashboard", { state: { refresh: true } });
      }, 1500);
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
      {successMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-green-300 text-green-800 px-6 py-3 rounded-xl shadow-2xl animate-fade-in">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#d1fae5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" stroke="#10b981" />
          </svg>
          <span className="font-semibold text-lg">{successMsg}</span>
        </div>
      )}
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar role={currentUser.role || "Teacher"} />
      </div>
      <div className="flex-1 ml-65 p-6 h-screen overflow-y-auto"> {/* Adjusted layout */}
        <div className="max-w-6xl mx-0"> {/* Removed auto centering and adjusted width */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-left">
            Create New Request
          </h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4 border border-gray-200 relative">
            {submitting && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-20 rounded-lg animate-fade-in">
                <svg className="animate-spin h-10 w-10 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span className="text-blue-700 font-semibold">Submitting request...</span>
              </div>
            )}
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
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-500 hover:placeholder-gray-700 transition duration-200"
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
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-500 hover:placeholder-gray-700 transition duration-200"
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
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-500 hover:placeholder-gray-700 transition duration-200"
              >
                <option value="">-- Select Concern --</option>
                <option value="Repair">Repair</option>
                <option value="Construction">Construction</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Maintenance">Installation</option>
                
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
                rows="4"
                required
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-200 resize-none"
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
