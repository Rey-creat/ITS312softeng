// DEPT

import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";

const DeptHeadPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [notedBy, setNotedBy] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/depthead/all-requests");
      // Only show requests where noted_by is null or 'Pending'
      const filtered = res.data.filter(req => !req.noted_by || req.noted_by === "Pending");
      setRequests(filtered.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleNotedBySubmit = async (e) => {
    e.preventDefault();
    if (!notedBy.trim()) {
      setFeedbackMessage("Please enter a name.");
      setFeedbackType("error");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/depthead/requests/${currentRequestId}/noted`,
        { noted_by: notedBy }
      );

      const updatedRequest = requests.find(req => req.id === currentRequestId);

      setRequests(prev => prev.filter(req => req.id !== currentRequestId));

      // Save array of noted requests
      const notedRequest = { ...updatedRequest, noted_by: notedBy };
      const existing = JSON.parse(localStorage.getItem("notedRequests")) || [];
      const updatedList = [...existing, notedRequest];
      localStorage.setItem("notedRequests", JSON.stringify(updatedList));

      setFeedbackMessage("Request noted successfully.");
      setFeedbackType("success");

      setShowModal(false);
      setNotedBy("");
      setCurrentRequestId(null);

      setTimeout(() => setFeedbackMessage(""), 3000); // Clear success message after 3 seconds

    } catch (err) {
      console.error("Error updating noted_by:", err);
      setFeedbackMessage("Failed to save. Try again.");
      setFeedbackType("error");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="flex h-screen">
      <div className="relative">
        <AdminSidebar deptHeadHasRequests={requests.length > 0} />
      </div>
      <div className={`flex-1 p-6 bg-gray-100 overflow-y-auto ${showModal ? "blur-sm" : ""}`}>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Department Head</h1>
          {requests.length > 0 && (
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="You have requests to review"></span>
          )}
        </div>

        {feedbackMessage && (
          <div className={`p-4 mb-4 rounded ${feedbackType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {feedbackMessage}
          </div>
        )}

        {requests.length > 0 && (
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4 font-semibold">
            You have {requests.length} request{requests.length > 1 ? "s" : ""} to review.
          </div>
        )}

        {requests.length === 0 ? (
          <div className="flex items-center justify-center flex-col text-gray-600 mt-8">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No requests.</p>
            <p className="text-sm">All requests have been processed or are awaiting prior endorsements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"> {/* Card layout for requests */}
            {requests.map(req => (
              <div key={req.id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"> {/* Card design */}
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
                <div className="grid grid-cols-1 gap-2 mb-4"> {/* Simplified details layout */}
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Date Filed:</span>
                    <span className="ml-2 text-gray-900">{formatDate(req.date_filed)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Date Needed:</span>
                    <span className="ml-2 text-gray-900">{formatDate(req.date_needed)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Type:</span>
                    <span className="ml-2 text-gray-900">{req.type_of_concern}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Description:</span>
                    <span className="ml-2 text-gray-700">{req.description}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Requested By:</span>
                    <span className="ml-2 text-gray-900">{req.requested_by}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Noted By:</span>
                    <span className="ml-2 text-gray-900">{req.noted_by || "—"}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-4"> {/* Action buttons */}
                  <button
                    onClick={() => {
                      setCurrentRequestId(req.id);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Noted By
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Noted By</h2>
            <form onSubmit={handleNotedBySubmit}>
              <label className="block mb-2 font-medium">Noted By:</label>
              <input
                type="text"
                value={notedBy}
                onChange={(e) => setNotedBy(e.target.value)}
                className="w-full border p-2 rounded mb-4"
                placeholder="Enter department name..."
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptHeadPage;
