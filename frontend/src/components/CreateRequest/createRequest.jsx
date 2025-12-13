import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaCalendarCheck, 
  FaTools, 
  FaAlignLeft, 
  FaPaperPlane, 
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft 
} from "react-icons/fa";

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
    urgency: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [urgencyOptions, setUrgencyOptions] = useState(["Low", "Medium", "High"]);

  // Fetch distinct urgency levels from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/requests/urgency-options", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        if (Array.isArray(res.data)) {
          setUrgencyOptions(res.data.length ? res.data : ["Low", "Medium", "High"]);
        }
      })
      .catch(() => {
        setUrgencyOptions(["Low", "Medium", "High"]);
      });
  }, []);

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

  const handleRadioChange = (e) => {
    setFormData({ ...formData, type_of_concern: e.target.value });
    if (errors.type_of_concern) {
      setErrors({ ...errors, type_of_concern: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date_filed) newErrors.date_filed = "Date Filed is required.";
    if (!formData.date_needed) newErrors.date_needed = "Date Needed is required.";
    if (!formData.type_of_concern) newErrors.type_of_concern = "Type of Concern is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.urgency) newErrors.urgency = "Urgency level is required.";
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
        department: currentUser.department || formData.department || ""
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in">
          <FaCheckCircle className="w-5 h-5 text-white" />
          <span className="font-semibold text-base">{successMsg}</span>
        </div>
      )}
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar role={currentUser.role || "Teacher"} fullname={currentUser.fullname} />
      </div>
      <div className="flex-1 ml-65 p-4 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <div className="text-lg text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                  <p className="text-gray-600 text-xs">Fill in all required fields to submit your request</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 relative">
              {submitting && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                  <span className="text-blue-700 font-semibold text-base">Submitting request...</span>
                  <p className="text-gray-600 mt-1 text-xs">Please wait while we process your submission</p>
                </div>
              )}

              {/* Date Fields - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Filed - Left */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label htmlFor="date_filed" className="flex items-center text-base font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="mr-2 text-blue-500 text-sm" />
                    Date Filed <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_filed"
                    name="date_filed"
                    value={formData.date_filed}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-base"
                    aria-describedby="date_filed_help"
                    disabled={formData.date_filed === todayStr}
                  />
                  {errors.date_filed && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date_filed}</p>}
                  {formData.date_filed && (
                    <p id="date_filed_help" className="text-base text-gray-600 mt-2">
                      <span className="font-medium">Selected:</span> {formatDatePretty(formData.date_filed)}
                    </p>
                  )}
                </div>
                {/* Date Needed - Right */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label htmlFor="date_needed" className="flex items-center text-base font-medium text-gray-700 mb-2">
                    <FaCalendarCheck className="mr-2 text-green-500 text-sm" />
                    Date Needed <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_needed"
                    name="date_needed"
                    value={formData.date_needed}
                    onChange={handleChange}
                    required
                    min={formData.date_filed}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-base"
                    aria-describedby="date_needed_help"
                  />
                  {errors.date_needed && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date_needed}</p>}
                  {formData.date_needed && (
                    <p id="date_needed_help" className="text-base text-gray-600 mt-2">
                      <span className="font-medium">Selected:</span> {formatDatePretty(formData.date_needed)}
                    </p>
                  )}
                </div>
              </div>
              {/* Type of Concern - Radio Buttons */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="flex items-center text-base font-medium text-gray-700 mb-3">
                  <FaTools className="mr-2 text-purple-500 text-sm" />
                  Type of Concern <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.type_of_concern && <p className="text-red-500 text-xs mb-2 font-medium">{errors.type_of_concern}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Repair */}
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    formData.type_of_concern === 'Repair' 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="type_of_concern"
                      value="Repair"
                      checked={formData.type_of_concern === 'Repair'}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-base font-medium text-gray-900 flex items-center">
                        <span className="mr-2"></span> Repair
                      </span>
                      <span className="text-base text-gray-500 mt-0.5 block">Fix or restore something that's broken</span>
                    </div>
                  </label>
                  {/* Construction */}
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    formData.type_of_concern === 'Construction' 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="type_of_concern"
                      value="Construction"
                      checked={formData.type_of_concern === 'Construction'}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-base font-medium text-gray-900 flex items-center">
                        <span className="mr-2"></span> Construction
                      </span>
                      <span className="text-base text-gray-500 mt-0.5 block">Build new structures or major renovations</span>
                    </div>
                  </label>
                  {/* Maintenance */}
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    formData.type_of_concern === 'Maintenance' 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="type_of_concern"
                      value="Maintenance"
                      checked={formData.type_of_concern === 'Maintenance'}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-base font-medium text-gray-900 flex items-center">
                        <span className="mr-2"></span> Maintenance
                      </span>
                      <span className="text-base text-gray-500 mt-0.5 block">Regular upkeep or preventive maintenance</span>
                    </div>
                  </label>
                  {/* Installation */}
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    formData.type_of_concern === 'Installation' 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}>
                    <input
                      type="radio"
                      name="type_of_concern"
                      value="Installation"
                      checked={formData.type_of_concern === 'Installation'}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-base font-medium text-gray-900 flex items-center">
                        <span className="mr-2"></span> Installation
                      </span>
                      <span className="text-base text-gray-500 mt-0.5 block">Set up new equipment or systems</span>
                    </div>
                  </label>
                </div>
              </div>
              {/* Urgency Level */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label htmlFor="urgency" className="flex items-center text-base font-medium text-gray-700 mb-2">
                  <FaTools className="mr-2 text-red-500 text-sm" />
                  Urgency Level <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
                  required
                >
                  <option value="">Select urgency</option>
                  <option value="Critical">Critical – Immediate safety risk</option>
                  <option value="High">High – Affects operations</option>
                  <option value="Medium">Medium – Minor issue</option>
                  <option value="Low">Low – Non-urgent / cosmetic</option>
                </select>
              </div>
              {/* Description */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label htmlFor="description" className="flex items-center text-base font-medium text-gray-700 mb-2">
                  <FaAlignLeft className="mr-2 text-amber-500 text-sm" />
                  Description <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white resize-none text-base"
                  placeholder="Please provide a detailed description of your request. Include specific locations, items needing attention, and any relevant details about the issue..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-base text-gray-500">
                    Character count: {formData.description.length}
                  </span>
                  <span className="text-base text-gray-500">
                    Be as specific as possible for faster processing
                  </span>
                </div>
              </div>
              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none text-base"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting Request...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaPaperPlane className="mr-2" />
                      Submit Repair Request
                    </span>
                  )}
                </button>
                <p className="text-center text-base text-gray-500 mt-3">
                  Your request will be reviewed by the appropriate department heads
                </p>
              </div>
            </form>
          </div>
          {/* Quick Tips */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2 text-xs">💡</span>
              Tips for Faster Processing
            </h3>
            <ul className="space-y-1 text-gray-700 text-base">
              <li className="flex items-start">
                <span className="text-green-500 mr-1.5">✓</span>
                Provide clear and detailed descriptions with specific locations
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-1.5">✓</span>
                Include urgency level in your description if applicable
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-1.5">✓</span>
                Choose the correct concern type for proper routing
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-1.5">✓</span>
                Set realistic date needed expectations
              </li>
            </ul> 
          </div>
        </div>
      </div>
    </div>
  );
}