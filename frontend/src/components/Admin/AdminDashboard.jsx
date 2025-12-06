import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaCalendarAlt,
  FaTools,
  FaAlignLeft,
  FaClipboardCheck,
  FaSync,
  FaExclamationTriangle,
  FaEye,
  FaChartLine,
  FaBuilding
} from "react-icons/fa";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptHeadNeedsToNote, setDeptHeadNeedsToNote] = useState(false);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!token || !currentUser?.id) {
        navigate("/login");
        return;
      }

      await axios.get("http://localhost:5000/api/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(currentUser);

      const requestsRes = await axios.get(
        "http://localhost:5000/api/requests?role=Admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllRequests(requestsRes.data);

      // Check if any requests need to be noted by Dept Head
      const needsNote = requestsRes.data.some(r => !r.noted_by || r.noted_by === "Pending");
      setDeptHeadNeedsToNote(needsNote);

      const counts = {
        total: requestsRes.data.length,
        pending: requestsRes.data.filter((r) => r.status === "Pending").length,
        approved: requestsRes.data.filter((r) => r.status === "Approved").length,
        rejected: requestsRes.data.filter((r) => r.status === "Rejected").length,
      };

      setStats(counts);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="h-screen sticky top-0 left-0">
        <AdminSidebar role="Admin" deptHeadHasRequests={deptHeadNeedsToNote} />
      </div>

      <div className="flex-1 h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome, <span className="font-semibold text-blue-600">{user?.fullname}</span>! 
                Monitor and manage all system requests.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.fullname?.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">System Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {/* Total Requests Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaFileAlt className="text-xl text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                  TOTAL
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Requests</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>

            {/* Pending Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FaClock className="text-xl text-yellow-600" />
                </div>
                <span className="text-xs font-semibold text-yellow-500 bg-yellow-50 px-2 py-1 rounded">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  {stats.total > 0 ? `${Math.round((stats.pending / stats.total) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Approved Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaCheckCircle className="text-xl text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded">
                  COMPLETED
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">Approved</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
                <div className="text-xs text-green-600 font-medium">
                  {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Rejected Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FaTimesCircle className="text-xl text-red-600" />
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">
                  DECLINED
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">Rejected</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
                <div className="text-xs text-red-600 font-medium">
                  {stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions removed */}

          {/* All Requests Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">All User Requests</h2>
                  <p className="text-gray-600 text-xs mt-1">
                    Showing {allRequests.length} requests from all users
                  </p>
                </div>
                {deptHeadNeedsToNote && (
                  <div className="flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-full text-sm font-medium">
                    <FaExclamationTriangle className="mr-2" />
                    Dept Head Action Required
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {allRequests.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Filed</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Needed</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Noted By</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      {/* Actions column removed */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allRequests
                      .sort((a, b) => b.id - a.id)
                      .map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-medium text-blue-700">
                              {req.reference_code || `REQ-${req.id}`}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              <FaUser className="text-gray-400 mr-2" />
                              <span className="text-gray-700">{req.requested_by}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              <FaCalendarAlt className="text-gray-400 mr-2" />
                              <span className="text-gray-700">{formatDate(req.date_filed)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              <FaCalendarAlt className="text-gray-400 mr-2" />
                              <span className="text-gray-700">{formatDate(req.date_needed)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              <FaTools className="text-gray-400 mr-2" />
                              <span className="text-gray-700">{req.type_of_concern}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 max-w-xs">
                            <div className="flex items-start">
                              <FaAlignLeft className="text-gray-400 mr-2 mt-1" />
                              <span className="text-gray-700 line-clamp-2">{req.description}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center">
                              <FaClipboardCheck className="text-gray-400 mr-2" />
                              <span className={`font-medium ${req.noted_by ? 'text-green-600' : 'text-gray-500'}`}>
                                {req.noted_by || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              req.status === "Approved" 
                                ? "bg-green-100 text-green-800" 
                                : req.status === "Rejected" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {req.status === "Approved" ? <FaCheckCircle className="mr-1.5" /> : 
                               req.status === "Rejected" ? <FaTimesCircle className="mr-1.5" /> : 
                               <FaClock className="mr-1.5" />}
                              {req.status || "Pending"}
                            </span>
                          </td>
                          {/* Actions cell removed */}
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FaFileAlt className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-600 text-sm">
                    There are no requests in the system yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}