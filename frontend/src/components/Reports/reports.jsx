import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaSync,
  FaTools
} from "react-icons/fa";

// Format YYYY-MM-DD to Month Day, Year
const formatDate = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[month - 1]} ${day}, ${year}`;
  }
  return dateString;
};

export default function Reports() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch Requests
  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      setUser(currentUser);

      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Only show reports requested by the current user, sorted by latest date_filed
      const parseDate = (d) => {
        if (!d) return 0;
        const iso = Date.parse(d);
        if (!isNaN(iso)) return iso;
        const parts = d.split("-");
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
        }
        return 0;
      };
      const userReports = (res.data || [])
        .filter(r => r.requested_by === currentUser.fullname)
        .sort((a, b) => {
          const refA = parseInt(a.reference_code || a.id);
          const refB = parseInt(b.reference_code || b.id);
          return refB - refA;
        });
      setReports(userReports);
      setFilteredReports(userReports);
    } catch (err) {
      console.error("Failed to fetch requests:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Get final status for main row
  const getFinalStatus = (report) => {
    // If President rejected
    if (report.president_reject_reason || report.status === "Rejected") {
      return { text: "Rejected", color: "red", icon: <div className="mr-1.5" /> };
    }
    // If PPGS rejected
    if (report.ppgshead === "Rejected") {
      return { text: "Rejected", color: "red", icon: <div className="mr-1.5" /> };
    }
    // If Admin marked as done (and President approved)
    if (report.done_by) {
      return { text: "Completed", color: "green", icon: <div className="mr-1.5" /> };
    }
    // If President approved
    if (report.status === "Approved" || report.status === "Done") {
      return { text: "Approved", color: "green", icon: <div className="mr-1.5" /> };
    }
    // If PPGS approved, waiting for President
    if (report.ppgshead === "Approved") {
      return { text: "Pending", color: "amber", icon: <div className="mr-1.5" /> };
    }
    // If PPGS pending
    if (report.ppgshead === "Pending" || !report.ppgshead) {
      return { text: "Pending", color: "amber", icon: <div className="mr-1.5" /> };
    }
    // Default
    return { text: "Pending", color: "amber", icon: <div className="mr-1.5" /> };
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.reference_code?.toLowerCase().includes(term) ||
          String(report.id).toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((report) => {
        const finalStatus = getFinalStatus(report);
        
        if (statusFilter === "Pending") {
          return finalStatus.text === "Pending";
        } else if (statusFilter === "Completed") {
          return finalStatus.text === "Completed";
        } else if (statusFilter === "Rejected") {
          return finalStatus.text === "Rejected";
        }
        return true;
      });
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter]);

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Approved":
        return "bg-emerald-100 text-emerald-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Rejected":
      case "—": // Added this for rejected chain
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleMarkAsDone = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/requests/${requestId}`,
        { status: "Done" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: "Done" } : r)));
      setFilteredReports((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: "Done" } : r)));
      alert("Request marked as done.");
    } catch (err) {
      console.error("Error marking request as done", err);
      alert("Failed to mark request as done.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar role={user?.role} fullname={user?.fullname} />
      </div>
      <div className="flex-1 ml-72 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-2">Monitor and track all your requests with detailed status updates</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReports}
                className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Search and Status Filter Side by Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests Id..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center">
              <div className="text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Reports</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredReports.length} of {reports.length} requests
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Click on any row to view details
              </div>
            </div>
          </div>
          
          {filteredReports.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report) => {
                const isExpanded = expandedRows.has(report.id);
                const finalStatus = getFinalStatus(report);
                
                // Determine President status for expanded view
                const getPresidentStatus = () => {
                  if (report.ppgshead === "Rejected") {
                    return { text: "Rejected", color: "red" };
                  } else if (report.president_reject_reason || report.status === "Rejected") {
                    return { text: "Rejected", color: "red" };
                  } else if (report.status === "Approved" || report.status === "Done" || report.done_by) {
                    return { text: "Approved", color: "green" };
                  } else if (report.ppgshead === "Pending" || !report.ppgshead || report.ppgshead === "") {
                    return { text: "Pending", color: "yellow" };
                  } else {
                    return { text: "Pending", color: "yellow" };
                  }
                };
                
                const presidentStatus = getPresidentStatus();
                
                return (
                  <div key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* Main Row */}
                    <div 
                      className="px-6 py-5 cursor-pointer"
                      onClick={() => toggleRow(report.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FaFileAlt className="text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-semibold text-blue-700">
                                {report.reference_code || `REQ-${report.id}`}
                              </span>
                              <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                {report.type_of_concern}
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <div className="mr-1 text-gray-400" />
                              <span>{report.requested_by}</span>
                              <span className="mx-2">•</span>
                              <div className="mr-1 text-gray-400" />
                              <span>{formatDate(report.date_needed)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {/* Show final status in main row */}
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            finalStatus.color === "red"
                              ? "bg-red-100 text-red-800"
                              : finalStatus.color === "green"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {finalStatus.text}
                          </span>
                          <div>
                            {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-6 py-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Request Details */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <FaFileAlt className="mr-2 text-blue-500" />
                              Request Details
                            </h3>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Filed</p>
                                  <p className="text-gray-900 mt-1">{formatDate(report.date_filed)}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Needed</p>
                                  <p className="text-gray-900 mt-1">{report.date_needed ? formatDate(report.date_needed) : "—"}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Urgency Level</p>
                                <p className={
                                  `mt-1 font-semibold ` +
                                  (report.urgency === 'Critical' || report.urgency === 'Emergency' ? 'text-red-600' :
                                  report.urgency === 'High' || report.urgency === 'Urgent' ? 'text-orange-500' :
                                  report.urgency === 'Medium' || report.urgency === 'Normal' ? 'text-yellow-500' :
                                  report.urgency === 'Low' || report.urgency === 'Minor' ? 'text-green-600' :
                                  'text-gray-900')
                                }>
                                  {report.urgency || '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                                <p className="text-gray-900 mt-1">{report.description}</p>
                              </div>
                              {report.reopen_reason && (
                                <div>
                                  <p className="text-xs font-semibold text-orange-500 uppercase">Reopen Reason</p>
                                  <p className="text-gray-900 mt-1">{report.reopen_reason}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Approval Process */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <FaCheckCircle className="mr-2 text-green-500" />
                              Approval Process
                            </h3>
                            <div className="space-y-4">
                              {/* Dept Head */}
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Dept Head</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  report.noted_by && report.noted_by !== "Pending" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {report.noted_by && report.noted_by !== "Pending" ? report.noted_by : "Pending"}
                                </span>
                              </div>

                              {/* PPGS Head */}
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">PPGS Head</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  report.ppgshead === "Approved" 
                                    ? "bg-green-100 text-green-800" 
                                    : report.ppgshead === "Rejected" 
                                    ? "bg-red-100 text-red-800" 
                                    : report.noted_by === "Pending" || !report.noted_by || report.noted_by === ""
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {report.ppgshead === "Rejected" 
                                    ? "Rejected" 
                                    : (report.noted_by === "Pending" || !report.noted_by || report.noted_by === "")
                                    ? "Pending"
                                    : report.ppgshead || "Pending"}
                                </span>
                              </div>
                              
                              {/* Show PPGS rejection reason if rejected */}
                              {report.ppgshead === "Rejected" && report.ppgs_reject_reason && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-red-500 uppercase">PPGS Rejection Reason</p>
                                  <p className="text-gray-900 mt-1">{report.ppgs_reject_reason}</p>
                                </div>
                              )}

                              {/* President */}
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">President</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  presidentStatus.color === "red"
                                    ? "bg-red-100 text-red-800"
                                    : presidentStatus.color === "green"
                                    ? "bg-green-100 text-green-800"
                                    : presidentStatus.color === "yellow"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {presidentStatus.text}
                                </span>
                              </div>
                              
                              {/* Show President rejection reason if rejected */}
                              {presidentStatus.text === "Rejected" && report.president_reject_reason && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-red-500 uppercase">President Rejection Reason</p>
                                  <p className="text-gray-900 mt-1">{report.president_reject_reason}</p>
                                </div>
                              )}
                            </div>
                          </div>  

                          {/* Completion Status */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <FaTools className="mr-2 text-blue-500" />
                              Completion Status
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">PPGS Head</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  report.ppgshead === "Rejected" || presidentStatus.text === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : report.done_by
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {report.ppgshead === "Rejected" || presidentStatus.text === "Rejected"
                                    ? "Rejected"
                                    : report.done_by
                                    ? "Complete"
                                    : "Pending"}
                                </span>
                              </div>

                              {/* Show assigned personnel if exists */}
                              {report.assigned_personnel_name && (
                                <div>
                                  <p className="text-s font-semibold text-gray-700 uppercase">Assigned Personnel:</p>
                                  <p className="text-gray-900 mt-1">{report.assigned_personnel_name}</p>
                                  {report.assigned_role && (
                                    <p className="text-m text-gray-700 mt-1">Role: <span className="font-semibold text-gray-700">{report.assigned_role}</span></p>
                                  )}
                                </div>
                              )}
                              
                              {report.done_by && report.ppgshead !== "Rejected" && presidentStatus.text !== "Rejected" && (
                                <div>
                                  <p className="text-s font-semibold text-gray-700 uppercase">Completed by:</p>
                                  <p className="text-gray-900 mt-1">{report.assigned_personnel_name || report.done_by || "Unknown"}</p>
                                  {report.assigned_role && (
                                    <p className="text-m text-gray-700 mt-1">Role: <span className="font-semibold text-gray-700">{report.assigned_role}</span></p>
                                  )}
                                  {report.date_done && (
                                    <p className="text-m text-gray-700 mt-1">Marked complete by PPGS Head on: <span className="font-semibold text-gray-700">{report.date_done}</span></p>
                                  )}
                                  {report.proof_image && (
                                    <div className="mt-4">
                                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Proof Image</p>
                                      <img 
                                        src={`http://localhost:5000/uploads/${report.proof_image}`} 
                                        alt="Proof" 
                                        className="max-w-full h-auto rounded-lg border border-gray-200" 
                                      />
                                    </div>
                                  )}
                                </div>
                              )}  
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaFileAlt className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matching requests found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "All" 
                  ? "Try adjusting your search or filter criteria" 
                  : "You haven't submitted any requests yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}