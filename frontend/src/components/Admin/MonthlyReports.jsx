import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import {
  FaChartBar,
  FaCalendarAlt,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSync
} from "react-icons/fa";

export default function MonthlyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [ppgsHeadCount, setPpgsHeadCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [departmentStats, setDepartmentStats] = useState({});
  const [concernTypeStats, setConcernTypeStats] = useState({});
  const [roleStats, setRoleStats] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/requests?role=Admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);

        // Calculate PPGS Head pending count
        const ppgsPending = res.data.filter(r => r.ppgshead === "Pending" && r.noted_by && r.noted_by !== "Pending").length;
        setPpgsHeadCount(ppgsPending);

        // Calculate notifications count (requests needing personnel assignment)
        const notificationsPending = res.data.filter(r => r.status === "Approved" && (!r.assigned_to || r.assigned_to === "")).length;
        setNotificationsCount(notificationsPending);

        // Calculate monthly stats
        const stats = {};
        const departmentStats = {};
        const concernTypeStats = {};
        const roleStats = {};
        res.data.forEach(req => {
          const date = new Date(req.date_filed);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!stats[monthYear]) {
            stats[monthYear] = { total: 0, approved: 0, rejected: 0, completed: 0 };
          }
          stats[monthYear].total++;
          if (req.status === 'Approved' || req.done_by) stats[monthYear].approved++;
          if (req.ppgshead === 'Rejected' || req.status === 'Rejected') stats[monthYear].rejected++;
          if (req.done_by) stats[monthYear].completed++;

          // Calculate department stats (by department of the requester)
          const department = req.department || 'Unknown Department';
          if (!departmentStats[department]) {
            departmentStats[department] = { total: 0, completed: 0 };
          }
          departmentStats[department].total++;
          if (req.done_by) departmentStats[department].completed++;
          
          // Calculate concern type stats
          const concernType = req.type_of_concern || 'Other';
          if (!concernTypeStats[concernType]) {
            concernTypeStats[concernType] = { total: 0, completed: 0 };
          }
          concernTypeStats[concernType].total++;
          if (req.done_by) concernTypeStats[concernType].completed++;
          
          // Calculate role stats
          const role = req.assigned_role || 'Unassigned';
          if (!roleStats[role]) {
            roleStats[role] = { total: 0, completed: 0 };
          }
          roleStats[role].total++;
          if (req.done_by) roleStats[role].completed++;
        });
        setMonthlyStats(stats);
        setDepartmentStats(departmentStats);
        setConcernTypeStats(concernTypeStats);
        setRoleStats(roleStats);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50">
          <AdminSidebar ppgsHeadCount={ppgsHeadCount} notificationsCount={notificationsCount} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading monthly reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50 overflow-hidden">
      <div className="fixed top-0 left-0 h-screen z-20">
          <AdminSidebar ppgsHeadCount={ppgsHeadCount} notificationsCount={notificationsCount} />
      </div>
      <div className="flex-1 ml-72 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-gray-600 mt-2">Overview of requests by month</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(monthlyStats).sort(([a], [b]) => b.localeCompare(a)).map(([month, stats]) => (
            <div key={month} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
                  <p className="text-gray-600 text-sm">Monthly Summary</p>
                </div>
                <FaCalendarAlt className="text-2xl text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Requests:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved:</span>
                  <span className="font-semibold text-green-600">{stats.approved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected:</span>
                  <span className="font-semibold text-red-600">{stats.rejected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold text-blue-600">{stats.completed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Detailed Monthly Breakdown</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-900">Month</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Total</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Approved</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Rejected</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completed</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthlyStats).sort(([a], [b]) => b.localeCompare(a)).map(([month, stats]) => (
                  <tr key={month} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{month}</td>
                    <td className="py-3 text-center">{stats.total}</td>
                    <td className="py-3 text-center text-green-600">{stats.approved}</td>
                    <td className="py-3 text-center text-red-600">{stats.rejected}</td>
                    <td className="py-3 text-center text-blue-600">{stats.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department-wise Request Completion Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
          <div className="px-6 py-5 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Department-wise Request Analysis</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-900">Department</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Total Requests</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completed</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(departmentStats).sort(([,a], [,b]) => b.completed - a.completed).map(([department, stats]) => (
                  <tr key={department} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{department}</td>
                    <td className="py-3 text-center">{stats.total}</td>
                    <td className="py-3 text-center text-green-600 font-semibold">{stats.completed}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stats.total > 0 && (stats.completed / stats.total) >= 0.8 
                          ? 'bg-green-100 text-green-800' 
                          : stats.total > 0 && (stats.completed / stats.total) >= 0.5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                      </span>
                    </td>
                  </tr>
                ))}
                {Object.keys(departmentStats).length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No department data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Concern Type Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
          <div className="px-6 py-5 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Concern Type Analysis</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-900">Type of Concern</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Total Requests</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completed</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(concernTypeStats).sort(([,a], [,b]) => b.total - a.total).map(([concernType, stats]) => (
                  <tr key={concernType} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{concernType}</td>
                    <td className="py-3 text-center">{stats.total}</td>
                    <td className="py-3 text-center text-green-600 font-semibold">{stats.completed}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stats.total > 0 && (stats.completed / stats.total) >= 0.8 
                          ? 'bg-green-100 text-green-800' 
                          : stats.total > 0 && (stats.completed / stats.total) >= 0.5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                      </span>
                    </td>
                  </tr>
                ))}
                {Object.keys(concernTypeStats).length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No concern type data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role-wise Request Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
          <div className="px-6 py-5 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Role-wise Request Analysis</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-900">Role</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Total Requests</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completed</th>
                  <th className="text-center py-2 font-semibold text-gray-900">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(roleStats).sort(([,a], [,b]) => b.total - a.total).map(([role, stats]) => (
                  <tr key={role} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{role}</td>
                    <td className="py-3 text-center">{stats.total}</td>
                    <td className="py-3 text-center text-green-600 font-semibold">{stats.completed}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stats.total > 0 && (stats.completed / stats.total) >= 0.8 
                          ? 'bg-green-100 text-green-800' 
                          : stats.total > 0 && (stats.completed / stats.total) >= 0.5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                      </span>
                    </td>
                  </tr>
                ))}
                {Object.keys(roleStats).length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No role data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}