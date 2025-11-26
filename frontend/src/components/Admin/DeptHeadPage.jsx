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
      setRequests(res.data.sort((a, b) => a.id - b.id));
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

      setTimeout(() => setFeedbackMessage(""), 3000);

      navigate("/PPGSHeadPage");

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
      <AdminSidebar />
      <div className={`flex-1 p-6 bg-gray-100 overflow-y-auto ${showModal ? "blur-sm" : ""}`}>
        <h1 className="text-2xl font-bold text-gray-800">Department Head</h1>

        {feedbackMessage && (
          <div className={`p-4 mb-4 rounded ${feedbackType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {feedbackMessage}
          </div>
        )}

        {requests.length === 0 ? (
          <p>No requests available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"> {/* Adjusted gap and margin for better spacing */}
            {requests.map(req => (
              <div key={req.id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"> {/* Enhanced shadow and border */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">Request #{req.id}</h2> {/* Adjusted text size and color */}
                <p className="text-sm text-gray-900 mb-2"><strong>Date Filed:</strong> {formatDate(req.date_filed)}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Date Needed:</strong> {formatDate(req.date_needed)}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Type:</strong> {req.type_of_concern}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Description:</strong> {req.description}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Requested By:</strong> {req.requested_by}</p>
                <p className="text-sm text-gray-900 mb-4"><strong>Noted By:</strong> {req.noted_by || "—"}</p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setCurrentRequestId(req.id);
                      setShowModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition"
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
              <input
                type="text"
                value={notedBy}
                onChange={(e) => setNotedBy(e.target.value)}
                className="w-full border p-2 rounded mb-4"
                placeholder="Enter your name"
                autoFocus
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
