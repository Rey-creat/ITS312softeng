import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";
import { 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCalendarCheck,
  FaAlignLeft,
  FaArrowRight,
  FaSync,
  FaChartLine,
  FaHome,
  FaPlusCircle,
  FaEye
} from "react-icons/fa";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    counts: { total: 0, inProgress: 0, approved: 0, rejected: 0 },
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [previousTotal, setPreviousTotal] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Format date function remains exactly the same
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

  // fetchDashboard function remains exactly the same
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!currentUser?.id) return navigate("/login");

      // Verify JWT session with backend
      await axios.get("http://localhost:5000/api/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(currentUser);

      // Fetch all requests for dashboard stats
      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allRequests = res.data || [];

      // Filter requests to only include those created by the current user
      const userRequests = allRequests.filter(r => r.user_id === currentUser.id);

      // Calculate counts
      const total = userRequests.length;
      const inProgress = userRequests.filter(r => !r.done_by && (!r.ppgshead || r.ppgshead !== "Rejected") && (!r.status || r.status !== "Rejected")).length;
      const approved = userRequests.filter(r => r.done_by && (!r.ppgshead || r.ppgshead !== "Rejected") && (!r.status || r.status !== "Rejected")).length;
      const rejected = userRequests.filter(r => r.ppgshead === "Rejected" || r.status === "Rejected").length;

      // Recent requests (last 5, newest first)
      const recent = userRequests.slice().reverse().slice(0, 5);

      setStats({
        counts: { total, inProgress, approved, rejected },
        recent,
      });
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // All useEffect hooks remain exactly the same
  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (location?.state?.refresh) {
      fetchDashboard();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location?.state?.refresh]);

  useEffect(() => {
    if (stats.counts.total > previousTotal) {
      const totalElement = document.getElementById("total-requests");
      if (totalElement) {
        totalElement.classList.add("text-blue-600");
        setTimeout(() => {
          totalElement.classList.remove("text-blue-600");
        }, 2000);
      }
    }
    setPreviousTotal(stats.counts.total);
  }, [stats.counts.total]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar role={user?.role} fullname={user?.fullname} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome back, <span className="font-semibold text-blue-600">{user?.fullname}</span>! Here's your request summary.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboard}
                className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors duration-200 text-sm"
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

        {/* STATS CARDS */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Request Statistics</h2>
          
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
              <div className="flex items-end justify-between">
                <p id="total-requests" className="text-2xl font-bold text-gray-900">
                  {stats.counts.total}
                </p>
                <div className={`h-1 w-12 rounded-full ${stats.counts.total > previousTotal ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
            </div>

            {/* In Progress Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FaClock className="text-xl text-yellow-600" />
                </div>
                <span className="text-xs font-semibold text-yellow-500 bg-yellow-50 px-2 py-1 rounded">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">In Progress</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.counts.inProgress}
                </p>
                <div className="text-xs text-yellow-600 font-medium">
                  {stats.counts.total > 0 ? `${Math.round((stats.counts.inProgress / stats.counts.total) * 100)}%` : '0%'}
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
                  {stats.counts.approved}
                </p>
                <div className="text-xs text-green-600 font-medium">
                  {stats.counts.total > 0 ? `${Math.round((stats.counts.approved / stats.counts.total) * 100)}%` : '0%'}
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
                  {stats.counts.rejected}
                </p>
                <div className="text-xs text-red-600 font-medium">
                  {stats.counts.total > 0 ? `${Math.round((stats.counts.rejected / stats.counts.total) * 100)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/createRequest")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <FaPlusCircle className="text-lg" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">New Request</h3>
                    <p className="text-blue-100 text-xs">Submit a new repair request</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate("/myRequest")}
                className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <FaEye className="text-lg" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">View Requests</h3>
                    <p className="text-gray-300 text-xs">Track all your submissions</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate("/reports")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <FaChartLine className="text-lg" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Reports</h3>
                    <p className="text-purple-100 text-xs">View detailed analytics</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* RECENT REQUESTS SECTION */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
                  <p className="text-gray-600 text-xs mt-1">Your latest request submissions</p>
                </div>
                <button 
                  onClick={() => navigate("/myRequest")}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-sm"
                >
                  View All <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {stats.recent.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent.map((req) => {
                    // Status determination logic remains exactly the same
                    let statusLabel = "In Progress";
                    let statusColor = "bg-yellow-100 text-yellow-800";
                    let statusIcon = <FaClock className="text-yellow-600" />;
                    let statusBorder = "border-l-4 border-yellow-500";
                    
                    if (req.ppgshead === "Rejected" || req.status === "Rejected") {
                      statusLabel = "Rejected";
                      statusColor = "bg-red-100 text-red-800";
                      statusIcon = <FaTimesCircle className="text-red-600" />;
                      statusBorder = "border-l-4 border-red-500";
                    } else if (req.done_by) {
                      statusLabel = "Approved";
                      statusColor = "bg-green-100 text-green-800";
                      statusIcon = <FaCheckCircle className="text-green-600" />;
                      statusBorder = "border-l-4 border-green-500";
                    }
                    
                    return (
                      <div 
                        key={req.id} 
                        className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${statusBorder}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className={`p-2 rounded-lg ${statusColor.replace('text-', 'bg-').replace('800', '50')} mr-3`}>
                                {statusIcon}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm">{req.type_of_concern}</h3>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColor} mt-1`}>
                                  {statusIcon}
                                  <span className="ml-1.5">{statusLabel}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                              <div className="flex items-center text-gray-700">
                                <FaCalendarAlt className="text-gray-400 mr-2 text-sm" />
                                <div>
                                  <p className="text-xs text-gray-500">Date Filed</p>
                                  <p className="font-medium text-sm">{formatDate(req.date_filed)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center text-gray-700">
                                <FaCalendarCheck className="text-gray-400 mr-2 text-sm" />
                                <div>
                                  <p className="text-xs text-gray-500">Date Needed</p>
                                  <p className="font-medium text-sm">{formatDate(req.date_needed)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center text-gray-700">
                                <FaAlignLeft className="text-gray-400 mr-2 text-sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500">Description</p>
                                  <p className="font-medium text-sm truncate">{req.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <FaExclamationTriangle className="text-lg text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600 text-sm mb-4">Start by creating your first repair request</p>
                  <button
                    onClick={() => navigate("/createRequest")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                  >
                    <FaPlusCircle className="mr-2" />
                    Create New Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}