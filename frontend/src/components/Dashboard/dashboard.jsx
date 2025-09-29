// Dashboard.jsx
import React from "react";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar role="Teacher" />

      {/* Dashboard content on the right */}
      <div className="flex-1 bg-gray-100 p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 mb-6">
          Welcome back, <span className="font-semibold">Teacher Rey Rico</span> 👋
        </p>

        {/* Cards for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold">Total Requests</h2>
            <p className="text-3xl font-semibold text-blue-600">120</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold">Pending Requests</h2>
            <p className="text-3xl font-semibold text-yellow-500">35</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold">Completed</h2>
            <p className="text-3xl font-semibold text-green-600">85</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow hover:bg-blue-700 font-semibold">
            ➕ Create New Request
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-4 rounded-lg shadow hover:bg-gray-300 font-semibold">
            📊 View Reports
          </button>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-lg font-bold mb-4">Recent Requests</h2>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Reference Code</th>
                <th className="p-2">Type</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date Filed</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">REQ-001</td>
                <td className="p-2">Electrical</td>
                <td className="p-2 text-yellow-600">Pending</td>
                <td className="p-2">2025-09-29</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">REQ-002</td>
                <td className="p-2">Plumbing</td>
                <td className="p-2 text-green-600">Completed</td>
                <td className="p-2">2025-09-28</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">REQ-003</td>
                <td className="p-2">Carpentry</td>
                <td className="p-2 text-blue-600">In Progress</td>
                <td className="p-2">2025-09-27</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
