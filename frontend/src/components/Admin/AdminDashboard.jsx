// AdminDashboard.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar role="Admin" />

      {/* Dashboard content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Total Requests</h2>
            <p className="text-3xl font-semibold text-blue-600">240</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Pending Approval</h2>
            <p className="text-3xl font-semibold text-yellow-500">48</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Approved</h2>
            <p className="text-3xl font-semibold text-green-600">182</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Rejected</h2>
            <p className="text-3xl font-semibold text-red-600">10</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/DeptHeadPage"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 font-bold"
            >
              🏢 Dept. Office Head
            </a>
            <a
              href="/admin/vpfgs"
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-600 font-bold"
            >
              💼 VPFGS
            </a>
            <a
              href="/admin/personnel"
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 font-bold"
            >
              👷 Personnel in Charge
            </a>
            <a
              href="/admin/vpaa"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 font-bold"
            >
              📘 VPAA
            </a>
            <a
              href="/admin/president"
              className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700 font-bold"
            >
              🎓 School President
            </a>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Recent Approvals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2">Reference Code</th>
                  <th className="px-4 py-2">Requester</th>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Last Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2">REQ-045</td>
                  <td className="px-4 py-2">Juan Dela Cruz</td>
                  <td className="px-4 py-2">IT Dept</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    Approved
                  </td>
                  <td className="px-4 py-2">President</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">REQ-046</td>
                  <td className="px-4 py-2">Maria Santos</td>
                  <td className="px-4 py-2">HR Dept</td>
                  <td className="px-4 py-2 text-yellow-500 font-bold">
                    Pending
                  </td>
                  <td className="px-4 py-2">VPAA</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">REQ-047</td>
                  <td className="px-4 py-2">Carlos Reyes</td>
                  <td className="px-4 py-2">Finance</td>
                  <td className="px-4 py-2 text-red-600 font-bold">Rejected</td>
                  <td className="px-4 py-2">VPFGS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Summary */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Reports Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-lg font-bold">Most Active Dept</h3>
              <p className="text-xl text-blue-600 mt-2">IT Department</p>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-lg font-bold">Longest Pending</h3>
              <p className="text-xl text-yellow-600 mt-2">7 Days</p>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-lg font-bold">Monthly Approvals</h3>
              <p className="text-xl text-green-600 mt-2">65</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
