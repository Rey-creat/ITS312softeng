import React, { useEffect, useState } from "react";
import axios from "axios";
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
  FaSync
} from "react-icons/fa";

const PPGSHeadPage = () => {
      const [showRejectConfirm, setShowRejectConfirm] = useState(false);
      const [pendingRejectId, setPendingRejectId] = useState(null);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [pendingApproveId, setPendingApproveId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/ppgshead/approved-requests");
        // Only use backend data, ignore localStorage
        setRequests(res.data.sort((a, b) => b.id - a.id));
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = (id) => {
    setPendingApproveId(id);
    setShowApproveConfirm(true);
  };

  const confirmApprove = async () => {
    if (!pendingApproveId) return;
    try {
      await axios.put(`http://localhost:5000/api/ppgshead/requests/${pendingApproveId}/approve`);
      setRequests(prev =>
        prev.map(req => (req.id === pendingApproveId ? { ...req, ppgshead: "Approved" } : req))
      );
      setShowDetails(false);
      showNotification("Request approved successfully", "success");
    } catch (err) {
      console.error("Error approving request:", err);
      showNotification("Error approving request", "error");
    } finally {
      setShowApproveConfirm(false);
      setPendingApproveId(null);
    }
  };

  const cancelApprove = () => {
    setShowApproveConfirm(false);
    setPendingApproveId(null);
  };

  const handleReject = (id) => {
    setPendingRejectId(id);
    setRejectReason("");
    setShowRejectConfirm(true);
  };

  const confirmReject = async () => {
    if (!pendingRejectId) return;
    if (!rejectReason.trim()) {
      showNotification("Please provide a reason for rejection.", "error");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/ppgshead/requests/${pendingRejectId}/reject`,
        { reason: rejectReason },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setRequests(prev =>
        prev.map(req => (req.id === pendingRejectId ? { ...req, ppgshead: "Rejected", reject_reason: rejectReason } : req))
      );
      setShowDetails(false);
      showNotification("Request rejected successfully", "success");
    } catch (err) {
      console.error("Error rejecting request:", err);
      showNotification("Error rejecting request", "error");
    } finally {
      setShowRejectConfirm(false);
      setPendingRejectId(null);
      setRejectReason("");
    }
  };

  const cancelReject = () => {
    setShowRejectConfirm(false);
    setPendingRejectId(null);
    setRejectReason("");
  };

  const showNotification = (message, type) => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white flex items-center`;
    
    toast.innerHTML = `
      ${type === "success" ? 
        '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' :
        '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
      }
      ${message}
    `;
    
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter requests for display
  const notedRequests = requests.filter(req => req.noted_by);
  // Show requests needing PPGS action: ppgshead is null or 'Pending', and also allow 'Rejected' for review
  let reviewRequests = notedRequests.filter(req => req.ppgshead === null || req.ppgshead === undefined || req.ppgshead === "Pending" || req.ppgshead === "Rejected");
  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    reviewRequests = reviewRequests.filter(req =>
      req.requested_by?.toLowerCase().includes(query) ||
      req.type_of_concern?.toLowerCase().includes(query) ||
      req.description?.toLowerCase().includes(query) ||
      String(req.id).includes(query)
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar ppgsHeadHasRequests={reviewRequests.length > 0} />
        <div className="flex-1 flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar ppgsHeadHasRequests={reviewRequests.length > 0} />
      <div className="flex-1 overflow-y-auto bg-linear-to-br from-gray-50 to-blue-50">
        <div className="px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PPGS Head Requests</h1>
                <p className="text-gray-600 mt-1">
                  Review and process requests noted by department heads
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 w-full md:w-64"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                {reviewRequests.filter(r => r.ppgshead === "Pending").length > 0 && (
                  <div className="flex items-center px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                    <FaExclamationTriangle className="mr-2" />
                    <span className="font-medium">{reviewRequests.filter(r => r.ppgshead === "Pending").length} pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {reviewRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClipboardList className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                All requests have been processed or are awaiting prior endorsements.
                New requests will appear here once they are noted by department heads.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {reviewRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="px-5 py-4 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FaFileAlt className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Request #{req.id}</h3>
                          <p className="text-gray-600 text-xs mt-1">Awaiting PPGS approval</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        {req.ppgshead === "Rejected" ? (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">Rejected</span>
                        ) : (
                          "Pending Review"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Date Filed</p>
                            <p className="font-medium text-sm">{formatDate(req.date_filed)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Date Needed</p>
                            <p className="font-medium text-sm">{formatDate(req.date_needed)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FaTools className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Concern Type</p>
                            <p className="font-medium text-sm">{req.type_of_concern}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FaUser className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Requested By</p>
                            <p className="font-medium text-sm">{req.requested_by}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FaClipboardCheck className="text-green-500 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Noted By</p>
                            <p className="font-medium text-sm">{req.noted_by || "—"}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start text-gray-700">
                          <FaAlignLeft className="text-gray-400 mr-2 mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="font-medium text-sm mt-1">{req.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      {(req.ppgshead === null || req.ppgshead === undefined || req.ppgshead === "Pending") && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <FaCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                          >
                            <FaBan className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                  <p className="text-gray-600">Request #{selectedRequest.id}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTools className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Type of Concern</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedRequest.type_of_concern}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Date Filed</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(selectedRequest.date_filed)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarDay className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Date Needed</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(selectedRequest.date_needed)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Requested By</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedRequest.requested_by}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClipboardCheck className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Noted By</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedRequest.noted_by || "—"}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaHourglassHalf className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Current Status</h3>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRequest.ppgshead)}`}>
                    {selectedRequest.ppgshead || "Pending"}
                  </span>
                </div>

                {/* Urgency Level */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Urgency Level</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedRequest.urgency || "—"}</p>
                </div>
              </div>

              {/* Full Description */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <FaAlignLeft className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Full Description</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 px-6 py-3 text-base font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-3"
                >
                  <FaThumbsUp className="w-5 h-5" />
                  Approve Request
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex-1 px-6 py-3 text-base font-medium text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-3"
                >
                  <FaThumbsDown className="w-5 h-5" />
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                onClick={cancelApprove}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-5 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
              >
                <FaCheckCircle className="mr-2" />
                Yes, Approve
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
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelReject}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-5 py-2.5 bg-linear-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <FaTimesCircle className="mr-2" />
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPGSHeadPage;