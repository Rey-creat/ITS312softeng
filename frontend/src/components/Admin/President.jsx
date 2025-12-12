import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import {
  FaFileAlt,
  FaUser,
  FaCalendarAlt,
  FaCalendarDay,
  FaTools,
  FaAlignLeft,
  FaClipboardCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
  FaUserTie,
  FaCrown,
  FaHourglassHalf,
  FaSync,
  FaArrowRight,
  FaExclamationCircle,
  FaCheck,
  FaBan,
  FaExclamationTriangle
} from "react-icons/fa";

const President = () => {
    const [searchValue, setSearchValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
  const [decision, setDecision] = useState(null);
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    decision: null,
    id: null,
  });

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

        setRequests(
          data
            .filter((r) => r.ppgshead === "Approved" && (r.status === "Pending" || !r.status))
            .sort((a, b) => b.id - a.id)
        );
      } catch (err) {
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

  // Handle decision
  const handleDecision = async (id, decision) => {
    setProcessingId(id);
    setUpdating(true);
    setFeedbackMessage("");
    setFeedbackType("");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const president_by = user?.fullname || user?.name || "President";

      const res = await fetch(
        `http://localhost:5000/api/requests/${id}/president`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: decision, president_by, message }),
        }
      );

      if (res.ok) {
        setDecision(decision);
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setMessage("");
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
      setUpdating(false);
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

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({ open: false, decision: null, id: null });
  };

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
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="fixed inset-y-0 left-0 z-40 w-64">
        <AdminSidebar presidentHasRequests={requests.length > 0} />
      </div>
      <div className="ml-64 flex-1 h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-white-600 to-white-700 rounded-lg">
                <div className="text-3xl text-white" />
              </div>
              <div>
                <div className="flex items-center w-full">
                  <h1 className="text-2xl font-bold text-gray-900">President Dashboard</h1>
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping inline-block ml-2" title="You have requests to review"></span>
                </div>
                <p className="text-gray-600">Final approval stage for PPGS Head-endorsed requests</p>
                {/* President Summary Boxes under title/desc */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
                  <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-50 rounded-lg mr-4">
                        <FaFileAlt className="text-xl text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Request</p>
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
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="px-4 py-2 text-blue-700 font-bold text-base flex items-center">
                <FaCheckCircle className="inline-block mr-2 text-blue-500" />
                {requests.length} Pending Approval
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-white-100 hover:bg-white-200 text-black-700 font-semibold rounded-lg shadow transition-all border border-blue-200"
                title="Refresh requests"
              >
                <FaSync className="mr-1" />
                <span className="font-semibold">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search requests..."
              className="px-3 py-2 border rounded-lg bg-white text-gray-700 w-64"
            />
            <button
              onClick={() => setSearchTerm(searchValue)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Search
            </button>
            <button
              onClick={() => { setSearchValue(""); setSearchTerm(""); }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
          {requests.filter(r =>
            searchTerm === "" ||
            r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.type_of_concern?.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-3xl mx-auto">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending presidential approvals</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                All requests have been processed or are awaiting prior endorsements.
                New requests will appear here once they are approved by PPGS Head.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ml-5">
              {requests.filter(r =>
                searchTerm === "" ||
                r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.type_of_concern?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((req) => (
                <div 
                  key={req.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="px-6 py-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-purple-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-linear-to-r from-purple-100 to-blue-100 rounded-lg">
                            <FaFileAlt className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-blue-600">
                            Request #{req.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{req.type_of_concern}</h3>
                      </div>
                      <span className="px-3 py-1 bg-linear-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                        Final Review
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-5">
                    <div className="space-y-4">
                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Date Filed</span>
                          </div>
                          <p className="text-gray-900 font-medium pl-6">{formatDate(req.date_filed)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FaCalendarDay className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Date Needed</span>
                          </div>
                          <p className="text-gray-900 font-medium pl-6">{formatDate(req.date_needed)}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <FaAlignLeft className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-sm font-medium text-gray-500">Description</span>
                        </div>
                        <p className="text-gray-700 line-clamp-3 pl-6">{req.description}</p>
                      </div>

                      {/* Requester */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FaUser className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Requested By</span>
                        </div>
                        <p className="text-gray-900 font-medium pl-6">{req.requested_by}</p>
                      </div>

                      {/* Urgency */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FaExclamationTriangle className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Urgency</span>
                        </div>
                        <p className="text-gray-900 font-medium pl-6">{req.urgency}</p>
                      </div>

                      {/* Approval Chain */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaBuilding className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">Dept Head</span>
                            </div>
                            <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              {req.noted_by || "Noted"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FaUserTie className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">PPGS Head</span>
                            </div>
                            <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              Approved
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaCrown className="w-3 h-3 text-purple-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">President</span>
                            </div>
                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmModal({ open: true, decision: "Approved", id: req.id })}
                          disabled={processingId === req.id || updating}
                          className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-sm hover:shadow flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === req.id ? (
                            <>
                              <FaSync className="w-3 h-3 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <FaCheck className="w-3 h-3" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, decision: "Rejected", id: req.id })}
                          disabled={processingId === req.id || updating}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === req.id ? (
                            <>
                              <FaSync className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <FaBan className="w-4 h-4" />
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

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              </div>

              {/* Urgency */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Urgency Level</h3>
                <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedRequest.urgency}</p>
                    <p className="text-sm text-gray-600">Indicates the urgency of the request</p>
                  </div>
                </div>
              </div>

              {/* Approval Chain */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Approval Chain</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaBuilding className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Department Head</p>
                        <p className="text-sm text-gray-600">First level approval</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      {selectedRequest.noted_by || "Noted"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUserTie className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">PPGS Head</p>
                        <p className="text-sm text-gray-600">Second level approval</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      Approved
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaCrown className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">President</p>
                        <p className="text-sm text-gray-600">Final approval</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      Pending Your Decision
                    </span>
                  </div>
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
                  onClick={() => handleDecision(selectedRequest.id, "Approved")}
                  disabled={processingId === selectedRequest.id || updating}
                  className="flex-1 px-6 py-3 text-base font-medium text-white bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === selectedRequest.id ? (
                    <>
                      <FaSync className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-5 h-5" />
                      Approve Request
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDecision(selectedRequest.id, "Rejected")}
                  disabled={processingId === selectedRequest.id || updating}
                  className="flex-1 px-6 py-3 text-base font-medium text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === selectedRequest.id ? (
                    <>
                      <FaSync className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaBan className="w-5 h-5" />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (PPGSHead Style) */}
      {confirmModal.open && confirmModal.decision === "Approved" && (
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
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeConfirmModal();
                  handleDecision(confirmModal.id, confirmModal.decision);
                }}
                className="px-5 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
                disabled={updating}
              >
                <FaCheckCircle className="mr-2" />
                {updating ? "Processing..." : "Yes, Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && confirmModal.decision === "Rejected" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full border border-gray-200">
            <div className="flex items-center mb-4">
              <FaTimesCircle className="text-red-600 text-2xl mr-3" />
              <h2 className="text-lg font-bold text-gray-900">Confirm Rejection</h2>
            </div>
            <p className="text-gray-700 mb-4">Are you sure you want to <span className="font-semibold text-red-700">reject</span> this request? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeConfirmModal();
                  handleDecision(confirmModal.id, confirmModal.decision);
                }}
                className="px-5 py-2.5 bg-linear-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
                disabled={updating}
              >
                <FaTimesCircle className="mr-2" />
                {updating ? "Processing..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default President;