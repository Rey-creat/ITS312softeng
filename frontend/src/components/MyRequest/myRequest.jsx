// MyRequests.jsx
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const fetchMyRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/requests/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch my requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests();

    const handleRequestsUpdated = () => {
      fetchMyRequests();
    };

    const handleStorage = (e) => {
      // optional: only react to a specific key
      // if (e.key === "requests-updated") fetchMyRequests();
      fetchMyRequests();
    };

    window.addEventListener("requests-updated", handleRequestsUpdated);
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(fetchMyRequests, 10000); // polling fallback

    return () => {
      window.removeEventListener("requests-updated", handleRequestsUpdated);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [fetchMyRequests]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMyRequests();
      window.dispatchEvent(new Event("requests-updated"));
      try { localStorage.setItem("requests-updated", String(Date.now())); } catch (e) {}
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete request.");
    }
  };

  if (loading) return <div className="p-6">Loading your requests...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="Teacher" />
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">My Requests</h1>

        <div className="mb-4 flex items-center gap-2">
          <button onClick={fetchMyRequests} className="bg-blue-500 text-white px-3 py-1 rounded">
            Refresh
          </button>
          <span className="text-sm text-gray-600">Auto-refresh enabled</span>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Reference Code</th>
                <th className="px-6 py-3">Date Filed</th>
                <th className="px-6 py-3">Date Needed</th>
                <th className="px-6 py-3">Concern</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map((req) => (
                <tr key={req.id || req._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {req.referenceCode || req.refCode || `REQ-${req.id || req._id}`}
                  </td>
                  <td className="px-6 py-4">
                    {(req.date_filed || req.createdAt || "").split("T")[0]}
                  </td>
                  <td className="px-6 py-4">{(req.date_needed || "").split("T")[0]}</td>
                  <td className="px-6 py-4">
                    {(req.type_of_concern || req.type) + (req.description ? ` - ${req.description}` : "")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                      {req.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(req.referenceCode || req.refCode || `REQ-${req.id || req._id}`);
                      }}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
                    >
                      Copy Ref
                    </button>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500 italic">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
