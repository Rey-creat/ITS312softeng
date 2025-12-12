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
    // Export filtered reports to CSV
    const handleExport = () => {
      if (!filteredReports.length) return;
      // Define CSV headers
      const headers = [
        "Reference Code",
        "Type of Concern",
        "Requested By",
        "Date Filed",
        "Date Needed",
        "Description",
        "Dept Head",
        "PPGS Head",
        "President",
        "Completion Status",
        "Completed By"
      ];
      // Map reports to CSV rows
      const rows = filteredReports.map(r => [
        r.reference_code || `REQ-${r.id}`,
        r.type_of_concern,
        r.requested_by,
        r.date_filed,
        r.date_needed || "",
        r.description,
        r.noted_by,
        r.ppgshead,
        r.status,
        r.done_by ? "Done" : "Pending",
        r.done_by || ""
      ]);
      // Build CSV string
      const csvContent = [headers, ...rows]
        .map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reports.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
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
      if (statusFilter === "Pending") {
        filtered = filtered.filter(
          (report) =>
            report.ppgshead === "Pending" ||
            report.status === "Pending" ||
            !report.done_by
        );
      } else {
        filtered = filtered.filter((report) => report.ppgshead === statusFilter);
      }
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
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="mr-1.5" />;
      case "In Progress":
        return <FaExclamationTriangle className="mr-1.5" />;
      case "Approved":
      case "Completed":
        return <FaCheckCircle className="mr-1.5" />;
      case "Rejected":
        return <FaTimesCircle className="mr-1.5" />;
      default:
        return <FaClock className="mr-1.5" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
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
              
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <FaDownload className="mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests by reference, concern, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
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
                              <FaUser className="mr-2" />
                              <span>{report.requested_by}</span>
                              <span className="mx-2">•</span>
                              <FaCalendarAlt className="mr-2" />
                              <span>{formatDate(report.date_filed)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(report.ppgshead || "Pending")}`}>
                              {getStatusIcon(report.ppgshead || "Pending")}
                              {report.ppgshead || "Pending"}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(report.done_by ? "Completed" : "Pending")}`}>
                              {report.done_by ? <FaCheckCircle className="mr-1.5" /> : <FaClock className="mr-1.5" />}
                              {report.done_by ? "Done" : "Pending"}
                            </span>
                          </div>
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
                              </div>
                          </div>

                          {/* Approval Process */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <FaCheckCircle className="mr-2 text-green-500" />
                              Approval Process
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Dept Head</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${report.noted_by && report.noted_by !== "Pending" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                  {report.noted_by && report.noted_by !== "Pending" ? report.noted_by : "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">PPGS Head</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${report.ppgshead === "Approved" ? "bg-emerald-100 text-emerald-800" : report.ppgshead === "Rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                                  {report.ppgshead || "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">President</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  (report.status === "Approved" || report.status === "Done")
                                    ? "bg-green-100 text-green-800"
                                    : report.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {(report.status === "Approved" || report.status === "Done")
                                    ? "Approved"
                                    : report.status === "Rejected"
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Completion Status */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <FaTools className="mr-2 text-purple-500" />
                              Completion Status
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Marked by Personnel</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${report.done_by ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                                  {report.done_by ? "Done" : "Pending"}
                                </span>
                              </div>
                              {report.done_by && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Completed By</p>
                                  <p className="text-gray-900 mt-1">{report.done_by}</p>
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