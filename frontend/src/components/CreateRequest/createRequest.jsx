// CreateRequest.jsx
import React, { useState } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function CreateRequest() {
  const [formData, setFormData] = useState({
    dateFiled: new Date().toISOString().slice(0, 10), // today by default
    dateNeeded: "",
    referenceCode: "",
    concernId: "",
    description: "",
    requestedBy: "Teacher Rey Rico", // Example: later from login user
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Request Submitted:", formData);

    // TODO: connect this to your backend API
    // fetch("/api/requests", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData),
    // }).then(...);
    
    alert("Request submitted successfully ✅");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar role="Teacher" />

      {/* Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Request</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
        >
          {/* Date Filed */}
          <div>
            <label className="block font-semibold mb-1">Date Filed</label>
            <input
              type="date"
              name="dateFiled"
              value={formData.dateFiled}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              readOnly
            />
          </div>

          {/* Date Needed */}
          <div>
            <label className="block font-semibold mb-1">Date Needed</label>
            <input
              type="date"
              name="dateNeeded"
              value={formData.dateNeeded}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>

          {/* Reference Code */}
          <div>
            <label className="block font-semibold mb-1">Reference Code</label>
            <input
              type="text"
              name="referenceCode"
              value={formData.referenceCode}
              onChange={handleChange}
              placeholder="e.g., REQ-2025-001"
              className="w-full border p-2 rounded-lg"
              required
            />
          </div>

          {/* Type of Concern */}
          <div>
            <label className="block font-semibold mb-1">Type of Concern</label>
            <select
              name="concernId"
              value={formData.concernId}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              required
            >
              <option value="">-- Select Concern --</option>
              <option value="1">Electrical</option>
              <option value="2">Plumbing</option>
              <option value="3">Carpentry</option>
              <option value="3">Aircon Technicians</option>
              
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue or needed repair..."
              className="w-full border p-2 rounded-lg"
              rows="4"
              required
            ></textarea>
          </div>

          {/* Requested By */}
          <div>
            <label className="block font-semibold mb-1">Requested By</label>
            <input
              type="text"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
              readOnly
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 font-semibold"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
