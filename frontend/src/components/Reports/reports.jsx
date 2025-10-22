// Reports.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
      r.approvedBy || r.approver || ""
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "school_facility_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-6">Loading reports...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="Teacher" />
      <div className="flex-1 bg-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Export CSV</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold">Total Reports</h2>
            <p className="text-3xl font-semibold text-blue-600">{reports.length}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold">Completed</h2>
            <p className="text-3xl font-semibold text-green-600">{reports.filter((r) => r.status === "Completed").length}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold">Rejected</h2>
            <p className="text-3xl font-semibold text-red-600">{reports.filter((r) => r.status === "Rejected").length}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Reference Code</th>
                <th className="px-6 py-3">Filed By</th>
                <th className="px-6 py-3">Concern</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? reports.map((report) => (
                <tr key={report.id || report._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{report.referenceCode || report.refCode || `REQ-${report.id || report._id}`}</td>
                  <td className="px-6 py-4">{report.filedBy || report.requested_by || ""}</td>
                  <td className="px-6 py-4">{report.concern || report.type_of_concern || ""}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>{report.status}</span>
                  </td>
                  <td className="px-6 py-4">{report.approvedBy || report.approver || ""}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500 italic">No reports available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
