import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import {
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaCalendarAlt,
  FaTools,
  FaAlignLeft,
  FaClipboardCheck,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown,
  FaEye,
  FaBan,
  FaCheck,
  FaArrowRight,
  FaCalendarDay,
  FaClipboardList,
  FaSync,
  FaSearch,
  FaUserTie
} from "react-icons/fa";

// Utility function for date formatting
function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function President() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch requests");

        const data = await res.json();

        // Filter for PPGS Approved and President Pending
        setRequests(
          data
            .filter((r) => r.ppgshead === "Approved" && (r.status === "Pending" || !r.status || r.status === ""))
            .sort((a, b) => b.id - a.id)
        );
      } catch (err) {
        console.error("Error fetching requests:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    const handleStorage = (event) => {
      if (event.key === "ppgsheadApproved") {
        fetchRequests();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Modal logic handlers
  const openConfirmModal = (id, action) => {
    const req = requests.find(r => r.id === id);
    setSelectedRequest(req);
    if (action === "Approved") {
      setShowApproveConfirm(true);
    } else {
      setShowRejectConfirm(true);
    }
  };

  const closeConfirmModal = () => {
    setShowApproveConfirm(false);
    setShowRejectConfirm(false);
    setRejectReason("");
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    await handleDecision(selectedRequest.id, "Approved");
    closeConfirmModal();
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      showNotification("Please provide a reason for rejection.", "error");
      return;
    }
    if (!selectedRequest) return;
    await handleDecision(selectedRequest.id, "Rejected");
    closeConfirmModal();
  };

  // Handle decision
  const handleDecision = async (id, decision) => {
    setProcessingId(id);
    
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const president_by = user?.fullname || user?.name || "President";

      const payload = {
        status: decision,
        president_by,
        ...(decision === "Rejected" && { president_reject_reason: rejectReason }),
        ...(decision === "Approved" && { message: "Approved by President" })
      };

      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/president`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        showNotification(
          `Request ${decision === "Approved" ? "approved" : "rejected"} successfully`,
          "success"
        );
        setShowDetails(false);
      } else {
        const result = await res.json();
        showNotification(result.message || "Failed to update request", "error");
      }
    } catch (err) {
      showNotification("Error updating request. Please try again.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white flex items-center`;
    
    notification.innerHTML = `
      ${type === "success" ? 
        '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' :
        '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
      }
      ${message}
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Filter requests for display
  const filteredRequests = searchQuery.trim() ? 
    requests.filter(req =>
      req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requested_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.type_of_concern?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(req.id).includes(searchQuery)
    ) : requests;

  // Filter requests by urgency
  const urgencyFilteredRequests = filteredRequests.filter(req => 
    urgencyFilter === "All" || req.urgency === urgencyFilter
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <AdminSidebar presidentHasRequests={requests.length > 0} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading presidential requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar presidentHasRequests={requests.length > 0} />
      <div className="flex-1 overflow-y-auto bg-linear-to-br from-gray-50 to-blue-50">
        <div className="px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">President Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Final approval stage for PPGS Head-endorsed requests
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 w-full"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                {requests.length > 0 && (
                  <div className="flex items-center px-4 py-2.5 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                    <FaExclamationTriangle className="mr-2" />
                    <span className="font-medium">{requests.length} pending</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-lg mr-4">
                    <FaFileAlt className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                    <FaHourglassHalf className="text-xl text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Awaiting Review</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{requests.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency Filter Options */}
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white text-gray-700"
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {urgencyFilteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClipboardList className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending presidential approvals</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                All requests have been processed or are awaiting prior endorsements.
                New requests will appear here once they are approved by PPGS Head.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {urgencyFilteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="px-5 py-4 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FaFileAlt className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Request #{req.id}</h3>
                          <p className="text-gray-600 text-xs mt-1">Final Presidential Approval</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        Pending Review
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <div>
                            <p className="text-xs text-black">Date Filed</p>
                            <p className="font-medium text-sm text-black">{formatDate(req.date_filed)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div>
                            <p className="text-xs text-black">Date Needed</p>
                            <p className="font-medium text-sm text-black">{formatDate(req.date_needed)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div>
                            <p className="text-xs text-black">Concern Type</p>
                            <p className="font-medium text-sm text-black">{req.type_of_concern}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div>
                            <p className="text-xs text-black">Requested By</p>
                            <p className="font-medium text-sm text-black">{req.requested_by}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="text-gray-400 mr-2 mt-1" />
                          <div>
                            <p className="text-xs text-black">Description</p>
                            <p className="font-medium text-sm  text-black">{req.description}</p>
                          </div>
                        </div>
                         {/* Urgency Display */}
                      <div className="flex flex-col items-left">
                        <span className="text-sm font-medium text-gray-900">Urgency</span>
                        <span className={`px-2.5 py-1 rounded-full text-m font-semibold ${
                          req.urgency === "Critical" ? "bg-white-100 text-red-800" :
                          req.urgency === "High" ? "bg-white-100 text-orange-800" :
                          req.urgency === "Medium" ? "bg-white-100 text-yellow-600" :
                          "bg-green-100 text-green-800"
                        }`}>  
                          {req.urgency} 
                        </span>
                      </div>
                    </div>
                        <div className="flex items-center text-gray-700">
                          <div className="text-green-500 mr-2" />
                          <div>
                            <p className="text-xs text-green-600">PPGS Head</p>
                            <p className="font-medium text-sm text-green-700">{req.ppgshead || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="text-blue-500 mr-2" />
                          <div>
                            <p className="text-xs text-green-600">Dept Head</p>
                            <p className="font-medium text-sm text-green-700">{req.noted_by || "—"}</p>
                          </div>
                        </div>
                      </div>
                 
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openConfirmModal(req.id, "Approved")}
                          disabled={processingId === req.id}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === req.id ? (
                            <>
                              <FaSync className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openConfirmModal(req.id, "Rejected")}
                          disabled={processingId === req.id}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === req.id ? (
                            <>
                              <FaSync className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full border border-gray-200">
            <div className="flex items-center mb-4">
              <FaCheckCircle className="text-green-600 text-2xl mr-3" />
              <h2 className="text-lg font-bold text-gray-900">Confirm Approval</h2>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to <span className="font-semibold text-green-700">approve</span> this request?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-5 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
                disabled={processingId}
              >
                <FaCheckCircle className="mr-2" />
                {processingId ? "Processing..." : "Yes, Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full border border-gray-200">
            <div className="flex items-center mb-4">
              <FaTimesCircle className="text-red-600 text-2xl mr-3" />
              <h2 className="text-lg font-bold text-gray-900">Confirm Rejection</h2>
            </div>
            <p className="text-gray-700 mb-4">Are you sure you want to <span className="font-semibold text-red-700">reject</span> this request? This action cannot be undone.</p>
            <div className="mb-4">
              <label htmlFor="reject-reason" className="block text-gray-700 font-medium mb-2">Reason for rejection <span className="text-red-500">*</span></label>
              <textarea
                id="reject-reason"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 resize-none"
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Please provide a reason..."
                required
                disabled={processingId}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={processingId}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-5 py-2.5 bg-linear-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
                disabled={processingId}
              >
                <FaTimesCircle className="mr-2" />
                {processingId ? "Processing..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default President;