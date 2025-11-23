import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const DeptHeadPage = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [notedBy, setNotedBy] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "success" or "error"

  const fetchRequests = async () => {
    try {
      console.log("[DEBUG] Fetching all requests..."); // Debug log
      const res = await axios.get("http://localhost:5000/api/depthead/all-requests");
      console.log("[DEBUG] Requests fetched:", res.data); // Debug log
      // Sort requests by ID in ascending order
      const sortedRequests = res.data.sort((a, b) => a.id - b.id);
      setRequests(sortedRequests);
    } catch (err) {
      console.error("[DEBUG] Error fetching requests:", err); // Debug log
    }
  };

  const handleNotedBySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(`[DEBUG] Adding 'Noted By' for request ID: ${currentRequestId}`); // Debug log
      await axios.put(`http://localhost:5000/api/depthead/requests/${currentRequestId}/noted`, { noted_by: notedBy });
      setFeedbackMessage("Successfully added 'Noted By'.");
      setFeedbackType("success");
      setShowModal(false);
      setNotedBy("");
      setCurrentRequestId(null);
      fetchRequests();
    } catch (err) {
      console.error("[DEBUG] Error adding 'Noted By':", err); // Debug log
      setFeedbackMessage("Failed to add 'Noted By'. Please try again.");
      setFeedbackType("error");
    }
  };

  const openModal = (id) => {
    setCurrentRequestId(id);
    setShowModal(true);
    setFeedbackMessage(""); // Clear previous feedback
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`flex h-screen ${showModal ? 'overflow-hidden' : ''}`}>
      <AdminSidebar />
      <div className={`flex-1 p-6 bg-gray-100 overflow-y-auto ${showModal ? 'blur-sm' : ''}`}>
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
            {requests.map((req) => (
              <div key={req.id} className="bg-white shadow rounded p-4">
                <h2 className="text-lg font-bold mb-2">Request #{req.id}</h2>
                <p><strong>Date Filed:</strong> {formatDate(req.date_filed)}</p>
                <p><strong>Date Needed:</strong> {formatDate(req.date_needed)}</p>
                <p><strong>Type:</strong> {req.type_of_concern}</p>
                <p><strong>Description:</strong> {req.description}</p>
                <p><strong>Status:</strong> {req.status}</p>
                <p><strong>Noted By:</strong> {req.noted_by || "N/A"}</p>
                <div className="mt-4">
                  <button
                    onClick={() => openModal(req.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
        <div className="fixed inset-0 bg-blue bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Noted By</h2>
            <form onSubmit={handleNotedBySubmit}>
              <div className="mb-4">
                <label htmlFor="notedBy" className="block text-sm font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  id="notedBy"
                  value={notedBy}
                  onChange={(e) => setNotedBy(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
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
