// Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role="Teacher" />

      {/* Dashboard content */}
      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here’s a quick summary of your requests and reports.
          </p>
        </header>

        {/* Main content scrollable */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-8">
          {/* Overview cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold">Total Requests</h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">120</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold">Pending Requests</h2>
              <p className="text-3xl font-bold text-yellow-500 mt-2">35</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold">Completed</h2>
              <p className="text-3xl font-bold text-green-600 mt-2">85</p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold">Rejected</h2>
              <p className="text-3xl font-bold text-red-600 mt-2">5</p>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/createRequest"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 font-semibold"
              >
                ➕ Create New Request
              </Link>
              <Link
                to="/myRequest"
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-600 font-semibold"
              >
                📋 View My Requests
              </Link>
              <Link
                to="/reports"
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 font-semibold"
              >
                📊 View Reports
              </Link>
            </div>
          </section>

          {/* Recent Requests Table */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-700">
                    <th className="px-4 py-2">Reference Code</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Date Filed</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2">REQ-001</td>
                    <td className="px-4 py-2">Electrical</td>
                    <td className="px-4 py-2">2025-09-20</td>
                    <td className="px-4 py-2 text-yellow-500 font-bold">Pending</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">REQ-002</td>
                    <td className="px-4 py-2">Plumbing</td>
                    <td className="px-4 py-2">2025-09-18</td>
                    <td className="px-4 py-2 text-green-600 font-bold">Completed</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">REQ-003</td>
                    <td className="px-4 py-2">Carpentry</td>
                    <td className="px-4 py-2">2025-09-15</td>
                    <td className="px-4 py-2 text-red-600 font-bold">Rejected</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Reports Summary */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Reports Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-lg font-semibold">Most Reported Concern</h3>
                <p className="text-xl text-blue-600 mt-2">Electrical Issues</p>
              </div>
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-lg font-semibold">Avg. Resolution Time</h3>
                <p className="text-xl text-green-600 mt-2">3 Days</p>
              </div>
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-lg font-semibold">Monthly Requests</h3>
                <p className="text-xl text-yellow-600 mt-2">42</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
