import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const DeptHeadPage = () => {
  const [requests, setRequests] = useState([]);

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

  const handleApprove = async (id) => {
    try {
      console.log(`[DEBUG] Approving request with ID: ${id}`); // Debug log
      await axios.put(`http://localhost:5000/api/depthead/requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      console.error("[DEBUG] Error approving request:", err); // Debug log
    }
  };

  const handleReject = async (id) => {
    try {
      console.log(`[DEBUG] Rejecting request with ID: ${id}`); // Debug log
      await axios.put(`http://localhost:5000/api/depthead/requests/${id}/reject`);
      fetchRequests();
    } catch (err) {
      console.error("[DEBUG] Error rejecting request:", err); // Debug log
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Department Office Head</h1>
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

export default DeptHeadPage;
