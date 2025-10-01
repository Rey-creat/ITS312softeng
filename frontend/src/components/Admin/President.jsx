import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar"; // adjust path if needed

const President = () => {
  const [decision, setDecision] = useState(null);
  const [message, setMessage] = useState("");

  const handleApprove = () => {
    setDecision("approved");
    alert("Request Approved by the School President");
  };

  const handleReject = () => {
    setDecision("rejected");
    alert("Request Rejected by the School President");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Page Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">School President</h1>
        <p className="mb-4 text-gray-700">
          Final approval stage. The President has the authority to either fully approve or reject the request after all endorsements.
        </p>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Request Details</h2>
          <p><strong>Requester:</strong> Juan Dela Cruz</p>
          <p><strong>Request Type:</strong> Facility Repair</p>
          <p><strong>Description:</strong> Aircon in Room 201 not working.</p>

          <textarea
            className="w-full border rounded p-2 mt-4"
            rows="4"
            placeholder="Add your message to the requester..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="mt-4 flex gap-4">
            <button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>

          {decision && (
            <p className="mt-4">
              ✅ Decision: <strong>{decision}</strong> <br />
              📩 Message: {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default President;
