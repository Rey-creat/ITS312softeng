import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTools,
  FaAlignLeft,
  FaUser,
  FaCalendarAlt,
  FaCalendarDay,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaClipboardCheck,
  FaTachometerAlt,
  FaHistory,
  FaEye,
  FaArrowRight
} from "react-icons/fa";

export default function PersonnelDashboard() {
  const [user, setUser] = useState(null);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState({});
  const navigate = useNavigate();

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

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch(status) {
      case "Done":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: FaCheckCircle,
          label: "Completed"
        };
      case "Rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: FaTimesCircle,
          label: "Rejected"
        };
      case "In Progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: FaSpinner,
          label: "In Progress"
        };
      case "Approved":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: FaCheckCircle,
          label: "Approved"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: FaClock,
          label: "Pending"
        };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);

        const res = await axios.get(
          `http://localhost:5000/api/requests?has_assigned=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const filteredRequests = res.data.filter((r) => 
          r.assigned_to && r.assigned_to.trim() !== ""
        );
        
        // Sort requests: largest id first (newest first)
        const sortedRequests = filteredRequests.sort((a, b) => b.id - a.id);
        setAssignedRequests(sortedRequests);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setAssignedRequests([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Function to handle marking a request as done
  const handleMarkStatus = async (requestId, newStatus) => {
    if (!newStatus || typeof newStatus !== "string" || newStatus.trim() === "") {
      showNotification("Invalid status value. Please try again.", "error");
      return;
    }

    setProcessing(prev => ({ ...prev, [requestId]: true }));
    
    try {
      const token = localStorage.getItem("token");
      let body = { status: newStatus };
      if (newStatus === "Done") {
        const req = assignedRequests.find(r => r.id === requestId);
        body.done_by = req?.assigned_personnel_name || req?.assigned_to || "";
      }

      await axios.put(
        `http://localhost:5000/api/requests/${requestId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAssignedRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: newStatus, done_by: body.done_by || r.done_by } : r
        )
      );

      showNotification("Request marked as Done successfully!", "success");
    } catch (err) {
      console.error("Error updating status:", err);
      showNotification("Error updating status. Please try again.", "error");
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
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

  // Calculate statistics
  const stats = {
    total: assignedRequests.length,
    pending: assignedRequests.filter(r => r.status === "In Progress" || r.status === "Approved").length,
    completed: assignedRequests.filter(r => r.status === "Done").length,
    rejected: assignedRequests.filter(r => r.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <AdminSidebar role="Personnel" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading assigned tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="fixed inset-y-0 left-0 z-40 w-64">
        <AdminSidebar role="Personnel" />
      </div>
      <div className="ml-72 flex-1 h-screen overflow-y-auto"> 
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-white-500 to-white-600 rounded-lg">
                  <div className="text-xl text-white" />
                </div>
                <div>
                  <div className="flex items-center w-full">
                    <h1 className="text-2xl font-bold text-gray-900">Personnels Dashboard</h1>
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-ping inline-block ml-2" title="You have requests to review"></span>
                  </div>
                  <p className="text-gray-600">
                    Welcome! Here are the assigned tasks and responsibilities.
                  </p>
                  {/* Summary Boxes under title/desc */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
                    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-lg mr-4">
                          <FaTools className="text-xl text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Total Request</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{assignedRequests.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                          <FaClock className="text-xl text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-medium">Awaiting Review</p>
                          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Assigned Tasks</p>
                <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">

          {/* Assigned Requests */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900"></h2>
              <div className="flex items-center gap-2">
                <FaClipboardCheck className="text-orange-500" />
                <span className="text-sm font-medium text-gray-600">
                  {stats.pending} 
                </span>
              </div>
            </div>

            {assignedRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No assigned requests</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You don't have any assigned tasks at the moment.
                  New assignments will appear here when they are assigned to you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ml-5">
                {assignedRequests.map((req) => {
                  const statusInfo = getStatusInfo(req.status);
                  const StatusIcon = statusInfo.icon;
                    
                  return (
                    <div 
                      key={req.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
                    >
                      {/* Card Header */}
                      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FaTools className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-semibold text-blue-600">
                                Request #{req.id}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{req.type_of_concern}</h3>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.color} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="px-6 py-5">
                        <div className="space-y-4">
                          {/* Date Filed & Date Needed on same row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500">Date Filed</span>
                              </div>
                              <p className="text-gray-900 font-medium pl-6">{formatDate(req.date_filed)}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FaCalendarDay className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500">Date Needed</span>
                              </div>
                              <p className={`font-medium pl-6 ${
                                new Date(req.date_needed) < new Date() 
                                  ? "text-red-600" 
                                  : "text-gray-900"
                              }`}>
                                {formatDate(req.date_needed)}
                              </p>
                            </div>
                          </div>

                          {/* Description & Requester on next row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-start gap-2 mb-2">
                                <FaAlignLeft className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span className="text-sm font-medium text-gray-500">Description</span>
                              </div>
                              <p className="text-gray-700 line-clamp-2 pl-6">{req.description}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FaUser className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500">Requester</span>
                              </div>
                              <p className="text-gray-900 font-medium pl-6">{req.requested_by}</p>
                            </div>
                          </div>

                          {/* Assigned Personnel under all */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FaUser className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-medium text-blue-500">Assigned Personnel</span>
                            </div>
                            <p className="text-gray-900 font-medium pl-6">{(req.assigned_personnel_name === 'Reylan Malinao' ? '' : req.assigned_personnel_name) || (req.assigned_to === 'Reylan Malinao' ? '' : req.assigned_to)}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="flex gap-3">
                            {(req.status === "In Progress" || req.status === "Approved") && (
                              <button
                                onClick={() => handleMarkStatus(req.id, "Done")}
                                disabled={processing[req.id]}
                                className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all shadow-sm hover:shadow flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processing[req.id] ? (
                                  <>
                                    <FaSpinner className="w-3 h-3 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <FaCheck className="w-3 h-10" />
                                    Mark Done
                                  </>
                                )}
                              </button>
                            )}

                            {req.status === "Done" && (
                              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-green-200">
                                <FaCheckCircle className="w-4 h-4" />
                                Completed
                              </div>
                            )}

                            {req.status === "Rejected" && (
                              <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg border border-red-200">
                                <FaTimesCircle className="w-4 h-4" />
                                Rejected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
                  <p className={`font-medium ${
                    new Date(selectedRequest.date_needed) < new Date() 
                      ? "text-red-600" 
                      : "text-gray-900"
                  }`}>
                    {formatDate(selectedRequest.date_needed)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Requested By</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedRequest.requested_by}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h3>
                {(() => {
                  const statusInfo = getStatusInfo(selectedRequest.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border ${statusInfo.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-semibold">{statusInfo.label}</span>
                    </div>
                  );
                })()}
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

              {/* Action Button (if applicable) */}
              {(selectedRequest.status === "In Progress" || selectedRequest.status === "Approved") && (
                <div className="pt-6 border-t">
                  <button
                    onClick={() => {
                      handleMarkStatus(selectedRequest.id, "Done");
                      setShowDetails(false);
                    }}
                    disabled={processing[selectedRequest.id]}
                    className="w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing[selectedRequest.id] ? (
                      <>
                        <FaSpinner className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-5 h-5" />
                        Mark This Task as Done
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}