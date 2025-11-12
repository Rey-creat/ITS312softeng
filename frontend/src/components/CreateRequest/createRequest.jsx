import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

export default function CreateRequest() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    date_filed: new Date().toISOString().slice(0, 10),
    date_needed: "",
    type_of_concern: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        user_id: currentUser.id,
        requested_by: currentUser.fullname,
      };

      await axios.post("http://localhost:5000/api/requests", payload);

      alert("Request submitted successfully!");
      navigate("/dashboard", { state: { refresh: true } });
    } catch (err) {
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
          <input type="date" name="date_filed" value={formData.date_filed} readOnly className="w-full border p-2 rounded-lg" />
          <input type="date" name="date_needed" value={formData.date_needed} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
          <select name="type_of_concern" value={formData.type_of_concern} onChange={handleChange} required className="w-full border p-2 rounded-lg">
            <option value="">-- Specific Concern --</option>
            <option value="Repair">Repair</option>
            <option value="Construction">Construction</option>
            <option value="Maintenance">Maintenance</option>
           
          </select>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required className="w-full border p-2 rounded-lg" placeholder="Brief Description of the Request" />
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 font-semibold">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
