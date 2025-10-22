import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date_needed: "",
    type_of_concern: "",
    description: "",
    status: "Pending",
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:5000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const req = res.data;
        setFormData({
          date_needed: req.date_needed?.split("T")[0] || "",
          type_of_concern: req.type_of_concern || "",
          description: req.description || "",
          status: req.status || "Pending",
        });
      })
      .catch(() => {
        alert("Failed to load request.");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/requests/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request updated successfully ✅");
      navigate("/dashboard", { state: { refresh: true } });
    } catch (err) {
      alert("Failed to update request.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-600">Loading request...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role || "Teacher"} />
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Request</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <input type="date" name="date_needed" value={formData.date_needed} onChange={handleChange} required className="w-full border p-2 rounded-lg" />
          <select name="type_of_concern" value={formData.type_of_concern} onChange={handleChange} required className="w-full border p-2 rounded-lg">
            <option value="">-- Select Concern --</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Aircon Technicians">Aircon Technicians</option>
          </select>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required className="w-full border p-2 rounded-lg" />
          <select name="status" value={formData.status} onChange={handleChange} required className="w-full border p-2 rounded-lg">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-semibold">
            Update Request
          </button>
        </form>
      </div>
    </div>
  );
}
