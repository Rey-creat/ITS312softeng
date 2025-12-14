import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import {
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiActivity,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiUser,
  FiMail,
  FiKey,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiChevronRight,
  FiUserPlus,
  FiSettings,
  FiDownload,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiMoreVertical
} from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SuperadminDashboard = () => {
  // All useState hooks (only once each, at the top)
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  const [assignId, setAssignId] = useState(null);
  const [overrideId, setOverrideId] = useState(null);
  const [overridePersonnel, setOverridePersonnel] = useState("");
  const [assignPersonnel, setAssignPersonnel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  // Notification state
  const [notif, setNotif] = useState({ show: false, message: '', type: 'success' });
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  // Polling interval for refreshing requests
  useEffect(() => {
    if (activeTab === "requests") {
      const interval = setInterval(() => {
        fetchRequests();
      }, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
    } catch (err) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Validate required fields
    if (!newUser.fullname || !newUser.email || !newUser.role || !newUser.password) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Prepare user data without confirmPassword
      const userData = {
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
      };
      
      const res = await axios.post("http://localhost:5000/api/users", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 201) {
        // Success: close modal, reset form, and refresh
        setShowUserModal(false);
        setNewUser({
          fullname: "",
          email: "",
          role: "",
          password: "",
          confirmPassword: "",
        });
        fetchUsers();
        
        // Show success message
        alert("User created successfully!");
      }
    } catch (err) {
      console.error("Error adding user:", err);
      alert(`Error creating user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditUser = async () => {
    try {
      // Validate required fields
      if (!editUser.fullname || !editUser.email || !editUser.role) {
        setNotif({ show: true, message: "Please fill in all required fields", type: "error" });
        setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 2500);
        return;
      }

      const token = localStorage.getItem("token");
      // Prepare update data - only send changed fields
      const updateData = {
        fullname: editUser.fullname,
        email: editUser.email,
        role: editUser.role,
      };
      // Only include password if it was provided and not empty
      if (editUser.password && editUser.password.trim() !== "") {
        updateData.password = editUser.password;
      }
      const res = await axios.put(
        `http://localhost:5000/api/users/${editUser.id}`,
        updateData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      if (res.status === 200) {
        setEditUser(null);
        setShowUserModal(false);
        fetchUsers();
        setNotif({ show: true, message: "User updated successfully!", type: "success" });
        setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 2500);
      }
    } catch (err) {
      setNotif({ show: true, message: `Error updating user: ${err.response?.data?.message || err.message}`, type: "error" });
      setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 2500);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setNotif({ show: true, message: "User deleted successfully!", type: "success" });
      setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 2500);
    } catch (err) {
      setNotif({ show: true, message: `Error deleting user: ${err.response?.data?.message || err.message}`, type: "error" });
      setTimeout(() => setNotif({ show: false, message: '', type: 'success' }), 2500);
    }
    setDeleteModal({ show: false, user: null });
  };

  const handleAssignRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/requests/${assignId}/assign`,
        { assigned_to: assignPersonnel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssignId(null);
      setAssignPersonnel("");
      fetchRequests();
    } catch (err) {
      console.error("Error assigning request:", err);
    }
  };

  const getStatusColor = (status) => {
    const statusText = status || "pending";
    if (statusText.toLowerCase().includes("reject")) return "bg-red-50 text-red-700 border-red-200";
    if (statusText.toLowerCase().includes("approve") || statusText.toLowerCase().includes("done")) return "bg-green-50 text-green-700 border-green-200";
    if (statusText.toLowerCase().includes("complete")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "Superadmin": return "bg-purple-50 text-purple-700 border-purple-200";
      case "PPGSHead": return "bg-blue-50 text-blue-700 border-blue-200";
      case "DeptHead": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "President": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== "all") {
      const status = req.status || (req.done_by ? "Approved" : "In Progress");
      if (!status.toLowerCase().includes(statusFilter.toLowerCase())) return false;
    }
    if (searchTerm.trim() !== "") {
      const idList = searchTerm.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      if (idList.length > 0 && !idList.includes(req.id)) return false;
    }
    if (dateRange.start && req.date_filed) {
      if (new Date(req.date_filed) < new Date(dateRange.start)) return false;
    }
    if (dateRange.end && req.date_filed) {
      if (new Date(req.date_filed) > new Date(dateRange.end)) return false;
    }
    return true;
  });

  const filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics data for pie chart
  const stats = {
    counts: {
      total: requests.length,
      pending: requests.filter(
        (r) => !r.done_by && (r.status?.toLowerCase() === "pending" || !r.status)
      ).length,
      completed: requests.filter(
        (r) => r.done_by || (r.status && r.status.toLowerCase().includes("approve"))
      ).length,
      rejected: requests.filter(
        (r) => r.status && r.status.toLowerCase().includes("reject")
      ).length,
    },
    recent: requests.slice().reverse().slice(0, 5),
  };

  const pieChartData = [
    { name: 'Completed', value: stats.counts.completed, color: '#10b981' },
    { name: 'Pending', value: stats.counts.pending, color: '#f59e0b' },
    { name: 'Rejected', value: stats.counts.rejected, color: '#ef4444' },
  ];

  const tabs = [
    { id: "requests", label: "Requests", icon: <FiFileText /> },
    { id: "users", label: "User Management", icon: <FiUsers /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { id: "logs", label: "Activity Logs", icon: <FiActivity /> },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 w-64">
        <AdminSidebar
          role={currentUser?.role || "Superadmin"}
          fullname={currentUser?.fullname || "Superadmin"}
        />
      </div>
      
      {/* Main Content shifted right */}
      <div className="ml-64 flex-1 pl-6">
        {/* Notification UI */}
        {notif.show && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300
            ${notif.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {notif.message}
          </div>
        )}
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span className="font-medium text-gray-700">School Facilities Repair & Management System</span>
                <FiChevronRight className="mx-2" />
                <span className="text-gray-900 font-semibold">Superadmin Panel</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors duration-200">
                <FiSettings className="mr-2" />
                Settings
              </button>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.fullname || "Superadmin"}</p>
                  <p className="text-xs text-gray-500">{currentUser?.role || "Superadmin"}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {currentUser?.fullname?.charAt(0) || "S"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="px-8 pt-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards: Only show on Requests tab */}
        {activeTab === "requests" && (
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Requests Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.counts.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiFileText className="text-blue-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">All time facility requests</span>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">{stats.counts.pending}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <FiClock className="text-amber-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Awaiting action</span>
                </div>
              </div>

              {/* Complete Card */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.counts.completed}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Repairs completed</span>
                </div>
              </div>

              {/* Rejected Card */}
              <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-sm border border-red-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.counts.rejected}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FiXCircle className="text-red-600 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Requests declined</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Facility Repair Requests</h2>
                      <p className="text-sm text-gray-600 mt-1">Monitor and manage all facility repair requests</p>
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <div className="relative flex-1 md:flex-none">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by Request IDs (e.g. 1,5,3)"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        />
                      </div>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <FiFilter className="mr-2" />
                        Filters
                      </button>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date From
                          </label>
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date To
                          </label>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Filed</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Needed</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept Head Noted</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PPGS Head</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">President</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Personnel</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Done</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-8 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredRequests.length > 0 ? (
                        filteredRequests.sort((a, b) => b.id - a.id).map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">#{req.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(req.date_filed)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{req.date_needed ? formatDate(req.date_needed) : "—"}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-medium">{req.type_of_concern}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{req.requested_by || req.requester_name || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.noted_by)}`}>
                                {req.noted_by && req.noted_by !== "Pending" ? req.noted_by : "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.ppgshead)}`}>
                                {req.ppgshead && req.ppgshead !== "Pending" ? req.ppgshead : "Pending"}
                              </span>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                req.status === "Approved" || req.status === "Done"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : req.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {req.status === "Approved" || req.status === "Done"
                                  ? "Approved"
                                  : req.status === "Rejected"
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">
                              {req.assigned_personnel_name ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{req.assigned_personnel_name}</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">—</span>
                              )}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${req.done_by ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{req.done_by ? "Done" : "Pending"}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="px-6 py-12 text-center">
                            <div className="text-gray-400">
                              <FiFileText className="mx-auto text-4xl mb-3" />
                              <p className="text-lg font-medium text-gray-900">No requests found</p>
                              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage system users and permissions</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserModal(true);
                        setEditUser(null);
                      }}
                      className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <FiUserPlus className="mr-2" />
                      Add User
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="relative max-w-md">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                                  {user.fullname.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.fullname}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setEditUser({
                                      id: user.id,
                                      fullname: user.fullname,
                                      email: user.email,
                                      role: user.role,
                                      password: "", // Start with empty password
                                    });
                                    setShowUserModal(true);
                                  }}
                                  className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Edit"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ show: true, user })}
                                  className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete"
                                >
                                  <FiTrash2 />
                                </button>
                                    {/* Delete Confirmation Modal (single instance, outside table) */}
                                    {deleteModal.show && (
                                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                                          <div className="flex items-center mb-4">
                                            <FiTrash2 className="text-red-500 text-2xl mr-2" />
                                            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                                          </div>
                                          <p className="text-gray-700 mb-6">Are you sure you want to delete <span className="font-semibold">{deleteModal.user?.fullname}</span>? This action cannot be undone.</p>
                                          <div className="flex justify-end space-x-3">
                                            <button
                                              onClick={() => setDeleteModal({ show: false, user: null })}
                                              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() => handleDeleteUser(deleteModal.user.id)}
                                              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
                                            >
                                              Yes, Delete
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="text-gray-400">
                              <FiUsers className="mx-auto text-4xl mb-3" />
                              <p className="text-lg font-medium text-gray-900">No users found</p>
                              <p className="text-sm text-gray-500 mt-1">Add users to get started</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab with Pie Chart */}
            {activeTab === "analytics" && (
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-sm text-gray-600 mt-1">School facilities repair statistics and metrics</p>
                  </div>
                  <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <FiDownload className="mr-2" />
                    Export Report
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart Container */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Request Status Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} requests`, 'Count']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        {pieChartData.map((item) => (
                          <div key={item.name} className="text-center">
                            <div className="text-2xl font-bold" style={{ color: item.color }}>
                              {item.value}
                            </div>
                            <div className="text-sm text-gray-600">{item.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats and Recent Activity */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Quick Statistics</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Total Requests", value: stats.counts.total, icon: <FiFileText className="text-blue-600" /> },
                          { label: "Pending Actions", value: stats.counts.pending, icon: <FiClock className="text-amber-600" /> },
                          { label: "Completed Requests", value: stats.counts.completed, icon: <FiCheckCircle className="text-green-600" /> },
                          { label: "Rejection Rate", value: `${((stats.counts.rejected / stats.counts.total) * 100 || 0).toFixed(1)}%`, icon: <FiTrendingUp className="text-red-600" /> },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <div className="p-2 bg-gray-50 rounded-lg mr-3">
                                {stat.icon}
                              </div>
                              <span className="text-sm text-gray-700">{stat.label}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {stats.recent.map((req) => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                #{req.id} - {req.type_of_concern}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Filed by {req.requested_by || "Unknown"} • {formatDate(req.created_at)}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${
                              req.status === "Approved" || req.status === "Done"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : req.status === "Rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {req.status === "Approved" || req.status === "Done"
                                ? "Approved"
                                : req.status === "Rejected"
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
                    <p className="text-sm text-gray-600 mt-1">System activities and user actions</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>All Activities</option>
                      <option>User Actions</option>
                      <option>Request Updates</option>
                      <option>System Changes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {[...requests, ...users].sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at)).slice(0, 10).map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors duration-150">
                      <div className="shrink-0 mt-1">
                        {item.type_of_concern ? (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiFileText className="text-blue-600 text-lg" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FiUser className="text-green-600 text-lg" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.type_of_concern 
                                ? `Repair Request #${item.id} - ${item.type_of_concern}`
                                : `User ${item.fullname} ${item.updated_at ? 'updated' : 'created'}`
                              }
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.type_of_concern 
                                ? `${item.assigned_to ? `Assigned to ${item.assigned_to}` : 'Unassigned'} • Status: ${item.status || 'Pending'}`
                                : `${item.role} account • ${item.email}`
                              }
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDateTime(item.created_at || item.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editUser ? "Edit User" : "Add New User"}
                </h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditUser(null);
                    setNewUser({
                      fullname: "",
                      email: "",
                      role: "",
                      password: "",
                      confirmPassword: ""
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editUser ? editUser.fullname : newUser.fullname}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, fullname: e.target.value })
                        : setNewUser({ ...newUser, fullname: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editUser ? editUser.email : newUser.email}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, email: e.target.value })
                        : setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={editUser ? editUser.password || "" : newUser.password}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, password: e.target.value })
                        : setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={editUser ? "Enter new password (leave blank to keep current)" : "Enter password"}
                    minLength={6}
                  />
                  {editUser && editUser.password && editUser.password.length < 6 && editUser.password.length > 0 && (
                    <p className="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
                  )}
                </div>

                {!editUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={newUser.confirmPassword || ""}
                      onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm password"
                      minLength={6}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={editUser ? editUser.role : newUser.role}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, role: e.target.value })
                        : setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="PPGSHead">PPGS Head</option>
                    <option value="DeptHead">Department Head</option>
                    <option value="President">President</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditUser(null);
                    setNewUser({
                      fullname: "",
                      email: "",
                      role: "",
                      password: "",
                      confirmPassword: ""
                    });
                  }}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editUser ? handleEditUser : handleAddUser}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  {editUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminDashboard;