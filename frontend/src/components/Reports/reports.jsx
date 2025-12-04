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

      // Only show reports requested by the current user, sorted by latest date_filed
      const parseDate = (d) => {
        if (!d) return 0;
        // Try ISO first, fallback to YYYY-MM-DD
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
          // If reference_code is numeric, sort numerically
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
                 <th className="px-6 py-4">Status (Marked by Personnel)</th>
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
                    {/* Approval */}
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
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            report.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : report.status === "Rejected"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : report.status === "Pending"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {report.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-6 align-top w-1/3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          report.noted_by === "Pending"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}>
                          {report.noted_by === "Pending" ? "Pending" : "Done"}
                        </span>
                    </td>
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
