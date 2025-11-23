import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const PPGSHeadPage = () => {
  const [requests, setRequests] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("Pending");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null); // Added error state

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/ppgshead/approved-requests"
      );
      const sortedRequests = res.data.sort((a, b) => a.id - b.id);
      setRequests(sortedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/ppgshead/requests/${id}/approve`
      );
      fetchRequests();
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/ppgshead/requests/${id}/reject`
      );
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">PPGS Head</h1>
        {requests.length === 0 ? (
          <p>No requests available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white shadow rounded p-4">
                <h2 className="text-lg font-bold mb-2">Request #{req.id}</h2>
                <p>
                  <strong>Date Filed:</strong> {formatDate(req.date_filed)}
                </p>
                <p>
                  <strong>Date Needed:</strong> {formatDate(req.date_needed)}
                </p>
                <p>
                  <strong>Type:</strong> {req.type_of_concern}
                </p>
                <p>
                  <strong>Description:</strong> {req.description}
                </p>
                <p>
                  <strong>Status:</strong> {req.status}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PPGSHeadPage;
