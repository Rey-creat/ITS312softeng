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

  // FORMAT: Month Day, Year
  const formatDatePretty = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date_filed) return alert("Please select Date Filed");
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
    <div className="flex min-h-screen">
      <Sidebar role={currentUser.role || "Teacher"} />
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Request</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">

          {/* DATE FILED */}
          <label>Date Filed:</label>
          <input
            type="date"
            name="date_filed"
            value={formData.date_filed}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded-lg"
          />
          {/* MONTH DAY YEAR PREVIEW */}
          {formData.date_filed && (
            <p className="text-sm text-gray-600">
              📅 Selected: <span className="font-semibold">{formatDatePretty(formData.date_filed)}</span>
            </p>
          )}

          {/* DATE NEEDED */}
          <label>Date Needed:</label>
          <input
            type="date"
            name="date_needed"
            value={formData.date_needed}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded-lg"
          />
          {/* MONTH DAY YEAR PREVIEW */}
          {formData.date_needed && (
            <p className="text-sm text-gray-600">
              📅 Selected: <span className="font-semibold">{formatDatePretty(formData.date_needed)}</span>
            </p>
          )}

          {/* TYPE OF CONCERN */}
          <label>Type of Concern:</label>
          <select
            name="type_of_concern"
            value={formData.type_of_concern}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded-lg"
          >
            <option value="">-- Specific Concern --</option>
            <option value="Repair">Repair</option>
            <option value="Construction">Construction</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* DESCRIPTION */}
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full border p-2 rounded-lg"
            placeholder="Brief Description of the Request"
          />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
