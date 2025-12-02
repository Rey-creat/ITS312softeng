import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const PPGSHeadPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/ppgshead/approved-requests");
        let allRequests = res.data.sort((a, b) => a.id - b.id);

        // Load all noted requests stored from Dept Head
        const storedRequests = JSON.parse(localStorage.getItem("notedRequests")) || [];

        storedRequests.forEach(stored => {
          if (!allRequests.find(r => r.id === stored.id)) {
            allRequests.push(stored);
          }
        });

        setRequests(allRequests.sort((a, b) => a.id - b.id));
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/ppgshead/requests/${id}/approve`);
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, ppgshead: "Approved" } : req))
      );
      alert("Request approved successfully"); // Success message
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/ppgshead/requests/${id}/reject`);
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, ppgshead: "Rejected" } : req))
      );
      alert("Request rejected successfully"); // Success message
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const notedRequests = requests.filter(req => req.noted_by);
  // Only show requests where noted_by is set and ppgshead is 'Pending'
  const pendingRequests = requests.filter(req => req.noted_by && req.ppgshead === "Pending");

  return (
    <div className="flex h-screen">
      <AdminSidebar ppgsHeadHasRequests={pendingRequests.length > 0} />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800">PPGS Head</h1>

        {pendingRequests.length === 0 ? (
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
            {pendingRequests.map(req => (
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
                    onClick={() => handleApprove(req.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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