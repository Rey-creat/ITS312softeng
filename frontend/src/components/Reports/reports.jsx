import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

// Format YYYY-MM-DD to Month Day, Year (local, no timezone conversion)
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
    const [statusFilter, setStatusFilter] = useState("All"); // No change here, but keeping for context

  // ...existing code...

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

      // Only show reports requested by the current user
      const userReports = (res.data || []).filter(r => r.requested_by === currentUser.fullname);
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
      filtered = filtered.filter(
        (report) =>
          report.reference_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.type_of_concern?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

      if (statusFilter !== "All") {
        filtered = filtered.filter((report) => report.ppgshead === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter]);

  // Status color helper
  const getStatusColor = (ppgshead) => {
    switch (ppgshead) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar role={user?.role} />
      </div>
      <div className="flex-1 ml-65 p-8 h-screen overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reports Overview</h1>
          <p className="text-gray-600 mt-2">Monitor and track all requests in the system.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Total Requests</h2>
                <p className="text-3xl font-bold text-blue-600 mt-1">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Approved</h2>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{reports.filter((r) => r.status === "Approved").length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-700">Rejected</h2>
                <p className="text-3xl font-bold text-red-600 mt-1">{reports.filter((r) => r.status === "Rejected").length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search requests</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by reference, requester, concern, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={fetchReports}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
            <p className="text-sm text-gray-600 mt-1">Showing {filteredReports.length} of {reports.length} requests</p>
          </div>
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Request Details</th>
                <th className="px-6 py-4">Approval</th>
                 <th className="px-6 py-4">Status</th>
                {/* Removed PPGS Head Status column */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => alert(`View details for ${report.reference_code || `REQ-${report.id}`}`)} // Placeholder for navigation or modal
                  >
                    {/* Request Details */}
                    <td className="px-6 py-6 align-top w-1/3">
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference:</span>
                          <span className="ml-2 text-blue-700 font-medium">{report.reference_code || `REQ-${report.id}`}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filed By:</span>
                          <span className="ml-2 text-gray-900">{report.requested_by || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Concern:</span>
                          <span className="ml-2 text-gray-900">{report.type_of_concern}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description:</span>
                          <span className="ml-2 text-gray-700">{report.description}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Filed:</span>
                          <span className="ml-2 text-gray-700">{formatDate(report.date_filed)}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Needed:</span>
                          <span className="ml-2 text-gray-700">{report.date_needed ? formatDate(report.date_needed) : "—"}</span>
                        </div>
                      </div>
                    </td>
                    {/* Timeline */}
                    <td className="px-6 py-6 align-top w-1/3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Dept Head</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${report.noted_by && report.noted_by !== "Pending" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                            {report.noted_by && report.noted_by !== "Pending" ? report.noted_by : "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">PPGS Head</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${report.ppgshead === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : report.ppgshead === "Rejected" ? "bg-red-100 text-red-800 border-red-200" : report.ppgshead === "Pending" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
                            {report.ppgshead}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">President</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${report.status === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : report.status === "Rejected" ? "bg-red-100 text-red-800 border-red-200" : report.status === "Pending" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {report.status === "Approved" || report.status === "Rejected"
                              ? (report.president_by || report.status)
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Removed PPGS Head Status cell */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-lg font-medium">No matching requests found.</p>
                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
