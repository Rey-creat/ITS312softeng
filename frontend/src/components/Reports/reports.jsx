import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data || []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const exportToCSV = () => {
    const headers = ["Reference Code", "Filed By", "Concern", "Status", "Approved By"];
    const rows = reports.map((r) => [
      r.referenceCode || r.refCode || "",
      r.filedBy || r.requested_by || r.requester || "",
      r.concern || r.type_of_concern || "",
      r.status || "",
      r.approvedBy || r.approver || "",
    ]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "school_facility_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading reports...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="Teacher" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reports Overview</h1>
          <button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
          >
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Reports
            </h2>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {reports.length}
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700">Completed</h2>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {reports.filter((r) => r.status === "Completed").length}
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700">Rejected</h2>
            <p className="text-4xl font-bold text-red-600 mt-2">
              {reports.filter((r) => r.status === "Rejected").length}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 uppercase text-xs font-semibold tracking-wider text-gray-600">
              <tr>
                <th className="px-6 py-3">Reference Code</th>
                <th className="px-6 py-3">Filed By</th>
                <th className="px-6 py-3">Concern</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr
                    key={report.id || report._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {report.referenceCode ||
                        report.refCode ||
                        `REQ-${report.id || report._id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {report.filedBy || report.requested_by || ""}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {report.concern || report.type_of_concern || ""}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {report.approvedBy || report.approver || ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-500 italic"
                  >
                    No reports available.
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
