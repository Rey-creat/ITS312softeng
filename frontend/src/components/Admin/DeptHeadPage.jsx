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

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/depthead/all-requests");
      setRequests(res.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // Submit noted by
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
      const notedRequest = { ...updatedRequest, noted_by: notedBy };

      // Remove from local state
      setRequests(prev => prev.filter(req => req.id !== currentRequestId));

      // Save to localStorage array
      const existing = JSON.parse(localStorage.getItem("newNotedRequests")) || [];
      localStorage.setItem("newNotedRequests", JSON.stringify([...existing, notedRequest]));

      // Success feedback
      setFeedbackMessage("Request noted successfully.");
      setFeedbackType("success");

      // Navigate to PPGSHeadPage
      navigate("/PPGSHeadPage");

      // Reset modal
      setShowModal(false);
      setCurrentRequestId(null);
      setNotedBy("");
      setTimeout(() => setFeedbackMessage(""), 3000);

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
    new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className={`flex-1 p-6 bg-gray-100 overflow-y-auto ${showModal ? "blur-sm" : ""}`}>
        <h1 className="text-2xl font-bold mb-4">Department Office Head</h1>

        {feedbackMessage && (
          <div className={`p-4 mb-4 rounded ${feedbackType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {feedbackMessage}
          </div>
        )}

        {requests.length === 0 ? (
          <p>No requests available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white shadow rounded p-4">
                <h2 className="text-lg font-bold mb-2">Request #{req.id}</h2>
                <p><strong>Date Filed:</strong> {formatDate(req.date_filed)}</p>
                <p><strong>Date Needed:</strong> {formatDate(req.date_needed)}</p>
                <p><strong>Type:</strong> {req.type_of_concern}</p>
                <p><strong>Description:</strong> {req.description}</p>
                <p><strong>Requested By:</strong> {req.requested_by}</p>
                <p><strong>Noted By:</strong> {req.noted_by || "—"}</p>

                <button
                  onClick={() => { setCurrentRequestId(req.id); setShowModal(true); }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Add Noted By
                </button>
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
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptHeadPage;
