import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar"; // adjust path if needed

const President = () => {
  const [decision, setDecision] = useState(null);
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // For toast notification

  // Fetch only requests where ppgshead is Approved and status is Pending or not set
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch requests: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        // Only show requests where ppgshead is Approved and status is Pending or not set
        setRequests(data.filter(r => r.ppgshead === "Approved" && (r.status === "Pending" || !r.status)));
      } catch (err) {
        console.error("Failed to fetch requests for president:", err);
        setError(err.message);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();

    // Listen for storage changes to update requests automatically if PPGS Head approves
    const handleStorage = (event) => {
      if (event.key === "ppgsheadApproved") {
        fetchRequests();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleDecision = async (id, decision) => {
    setUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const president_by = user?.fullname || user?.name || "President";
      const res = await fetch(`http://localhost:5000/api/requests/${id}/president`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: decision, president_by, message }),
      });
      const result = await res.json();
      if (res.ok && result.success) { // Assuming backend returns { success: true, request: {...} }
        setDecision(decision);
        setRequests(prev => prev.filter(r => r.id !== id));
        setMessage("");
        // Always show notification immediately
        setNotification({
          type: decision === "Approved" ? "success" : "error",
          message: `Request ${decision === "Approved" ? "approved" : "rejected"} successfully`,
        });
        setTimeout(() => setNotification(null), 3000);
        // Refresh the list to ensure UI is in sync, but do not block notification
        fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(refreshRes => refreshRes.ok ? refreshRes.json() : [])
          .then(refreshData => {
            if (Array.isArray(refreshData)) {
              setRequests(refreshData.filter(r => r.ppgshead === "Approved" && (r.status === "Pending" || !r.status)));
            }
          });
      } else {
        const errorMsg = result.message || "Failed to update request status. Please try again.";
        setError(errorMsg);
        setNotification({ type: "error", message: errorMsg });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update president decision:", err);
      const errorMsg = "Error updating request. Please check your connection and try again.";
      setError(errorMsg);
      setNotification({ type: "error", message: errorMsg });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <div className="fixed top-0 left-0 h-screen z-20">
        <AdminSidebar presidentHasRequests={requests.some(r => r.ppgshead === "Approved" && (r.status === "Pending" || !r.status))} />
      </div>
      <div className="flex-1 ml-65 p-8 h-screen overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
         <h1 className="text-2xl font-bold text-gray-800">President</h1>
          <p className="text-gray-600 mt-2">
            Final approval stage. Review and decide on requests that have been endorsed by the Department Head and PPGS Head.
          </p>
        </div>

        {/* Success Notification Box - fixed position for visibility */}
        {notification && notification.type === "success" && (
          <div style={{position: 'fixed', top: 24, right: 24, zIndex: 9999}} className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-lg">
            <p className="font-medium">Success:</p>
            <p>{notification.message}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-medium">No requests pending President approval.</p>
            <p className="text-sm">All requests have been processed or are awaiting prior endorsements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Added grid layout for cards */}
            {requests.map((req) => (
              <div key={req.id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"> {/* Card layout */}
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
                <div className="grid grid-cols-1 gap-2 mb-4"> {/* Simplified details layout */}
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Reference Code:</span>
                    <span className="ml-2 text-blue-700 font-medium">{req.reference_code || `REQ-${req.id}`}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Date Filed:</span>
                    <span className="ml-2 text-gray-900">{req.date_filed}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Date Needed:</span>
                    <span className="ml-2 text-gray-900">{req.date_needed || "—"}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Requested By:</span>
                    <span className="ml-2 text-gray-900">{req.requested_by}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Type of Concern:</span>
                    <span className="ml-2 text-gray-900">{req.type_of_concern}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Description:</span>
                    <span className="ml-2 text-gray-700">{req.description}</span>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-500">Approval:</span>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Department Head</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${req.noted_by ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {req.noted_by || "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">PPGS Head</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${req.ppgshead === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : req.ppgshead === "Rejected" ? "bg-red-100 text-red-800 border-red-200" : req.ppgshead === "In Progress" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                        {req.ppgshead || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4"> {/* Action buttons */}
                  <button
                    onClick={() => handleDecision(req.id, "Approved")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(req.id, "Rejected")}
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

export default President;