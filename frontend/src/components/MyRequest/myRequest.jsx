// MyRequests.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function MyRequests() {
  // Example dummy data (replace with API fetch later)
  const [requests, setRequests] = useState([
    {
      id: 1,
      referenceCode: "REQ-2025-001",
      dateFiled: "2025-09-15",
      dateNeeded: "2025-09-20",
      concern: "Electrical - Broken lights in classroom",
      status: "Pending",
    },
    {
      id: 2,
      referenceCode: "REQ-2025-002",
      dateFiled: "2025-09-18",
      dateNeeded: "2025-09-22",
      concern: "Plumbing - Leaking faucet in restroom",
      status: "In Progress",
    },
    {
      id: 3,
      referenceCode: "REQ-2025-003",
      dateFiled: "2025-09-10",
      dateNeeded: "2025-09-12",
      concern: "Furniture - Broken chair in office",
      status: "Completed",
    },
    {
      id: 4,
      referenceCode: "REQ-2025-004",
      dateFiled: "2025-09-12",
      dateNeeded: "2025-09-14",
      concern: "Aircon not working in lab",
      status: "Rejected",
    },
  ]);

  // Helper function for status colors
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar role="Teacher" />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">My Requests</h1>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Reference Code</th>
                <th className="px-6 py-3">Date Filed</th>
                <th className="px-6 py-3">Date Needed</th>
                <th className="px-6 py-3">Concern</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{req.referenceCode}</td>
                  <td className="px-6 py-4">{req.dateFiled}</td>
                  <td className="px-6 py-4">{req.dateNeeded}</td>
                  <td className="px-6 py-4">{req.concern}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No requests found.
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
