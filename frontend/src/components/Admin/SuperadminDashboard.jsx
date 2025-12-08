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
  FiDownload
} from "react-icons/fi";

const SuperadminDashboard = () => {
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
    role: "Personnel",
    password: "",
  });
  const [assignId, setAssignId] = useState(null);
  const [assignPersonnel, setAssignPersonnel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowUserModal(false);
      setNewUser({
        fullname: "",
        email: "",
        role: "Personnel",
        password: "",
      });
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleEditUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${editUser.id}`,
        editUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditUser(null);
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error editing user:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
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

  const handleReorderRequest = async (id, direction) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/requests/${id}/reorder`,
        { direction },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error("Error reordering request:", err);
    }
  };

  const getStatusColor = (status) => {
    const statusText = status || "pending";
    if (statusText.toLowerCase().includes("reject")) return "bg-red-100 text-red-800";
    if (statusText.toLowerCase().includes("approve")) return "bg-green-100 text-green-800";
    if (statusText.toLowerCase().includes("complete")) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "Superadmin": return "bg-purple-100 text-purple-800";
      case "PPGSHead": return "bg-blue-100 text-blue-800";
      case "DeptHead": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = requests.filter(req => {
    // Filter by status
    if (statusFilter !== "all") {
      const status = req.status || (req.done_by ? "Approved" : "In Progress");
      if (!status.toLowerCase().includes(statusFilter.toLowerCase())) return false;
    }
    // Filter by searchTerm (comma-separated IDs)
    if (searchTerm.trim() !== "") {
      const idList = searchTerm.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      if (idList.length > 0 && !idList.includes(req.id)) return false;
    }
    return true;
  });

  const filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    counts: {
      total: requests.length,
      inProgress: requests.filter(
        (r) => !r.done_by && (r.status?.toLowerCase() === "pending" || !r.status)
      ).length,
      approved: requests.filter(
        (r) => r.done_by || (r.status && r.status.toLowerCase().includes("approve"))
      ).length,
      rejected: requests.filter(
        (r) => r.status && r.status.toLowerCase().includes("reject")
      ).length,
    },
    recent: requests.slice().reverse().slice(0, 5),
  };

  const tabs = [
    { id: "requests", label: "Requests", icon: <FiFileText /> },
    { id: "users", label: "User Management", icon: <FiUsers /> },
    { id: "reports", label: "Analytics", icon: <FiBarChart2 /> },
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
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <FiChevronRight className="mx-1" />
                <span className="font-medium text-gray-700">Superadmin Panel</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
                <FiSettings className="mr-2" />
                Settings
              </button>
              <div className="flex items-center space-x-3">
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
                className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.counts.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiFileText className="text-blue-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">All time requests</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.counts.inProgress}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <FiActivity className="text-yellow-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Pending</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Complete</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.counts.approved}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FiCheck className="text-green-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Completed requests</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.counts.rejected}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <FiX className="text-red-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Declined requests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">All Requests</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage and monitor all system requests</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by Request IDs (e.g. 1,5,3)"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <FiPlus className="mr-2" />
                        New Request
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredRequests.length > 0 ? (
                        filteredRequests.sort((a, b) => b.id - a.id).map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{req.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.type_of_concern}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.requested_by || req.requester_name || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                {req.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {req.assigned_to || (
                                <span className="text-gray-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(req.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setAssignId(req.id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="Assign"
                                >
                                  <FiUserPlus className="mr-1.5" />
                                  Assign
                                </button>
                                <div className="flex border-l border-gray-200 pl-2">
                                  <button
                                    onClick={() => handleReorderRequest(req.id, "up")}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Move Up"
                                  >
                                    <FiArrowUp size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleReorderRequest(req.id, "down")}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Move Down"
                                  >
                                    <FiArrowDown size={14} />
                                  </button>
                                </div>
                                <button className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                                  Override
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="text-gray-400">
                              <FiFileText className="mx-auto text-4xl mb-3" />
                              <p className="text-lg font-medium text-gray-900">No requests found</p>
                              <p className="text-sm text-gray-500 mt-1">Start by creating a new request</p>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage system users and permissions</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserModal(true);
                        setEditUser(null);
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                          <tr key={user.id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setEditUser(user);
                                    setShowUserModal(true);
                                  }}
                                  className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 />
                                </button>
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

            {/* Analytics Tab */}
            {activeTab === "reports" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-sm text-gray-600 mt-1">System performance and metrics overview</p>
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FiDownload className="mr-2" />
                    Export Report
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Request Distribution</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Approved", value: stats.counts.approved, color: "bg-green-500" },
                        { label: "In Progress", value: stats.counts.inProgress, color: "bg-yellow-500" },
                        { label: "Rejected", value: stats.counts.rejected, color: "bg-red-500" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{item.label}</span>
                            <span className="font-medium text-gray-900">{item.value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full`}
                              style={{ width: `${(item.value / stats.counts.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {stats.recent.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              #{req.id} - {req.type_of_concern}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatDate(req.created_at)}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                            {req.status || "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Logs</h2>
                <div className="space-y-4">
                  {[...requests, ...users].sort((a, b) => b.id - a.id).slice(0, 10).map((item) => (
                    <div key={`${item.id}-${item.type_of_concern ? 'request' : 'user'}`} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {item.type_of_concern ? (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiFileText className="text-blue-600" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FiUser className="text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.type_of_concern ? `Request #${item.id} updated` : `User ${item.fullname} ${editUser ? 'updated' : 'created'}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.type_of_concern 
                                ? `${item.type_of_concern} - ${item.assigned_to || 'Unassigned'}`
                                : `${item.role} - ${item.email}`
                              }
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.created_at || item.updated_at)}
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

      {/* Modals */}
      {assignId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Personnel
                  </label>
                  <input
                    type="text"
                    value={assignPersonnel}
                    onChange={(e) => setAssignPersonnel(e.target.value)}
                    placeholder="Enter personnel name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setAssignId(null);
                    setAssignPersonnel("");
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRequest}
                  disabled={!assignPersonnel}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    assignPersonnel
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Assign Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editUser ? "Edit User" : "Add New User"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editUser ? editUser.fullname : newUser.fullname}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, fullname: e.target.value })
                        : setNewUser({ ...newUser, fullname: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editUser ? editUser.email : newUser.email}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, email: e.target.value })
                        : setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={editUser ? editUser.role : newUser.role}
                    onChange={(e) =>
                      editUser
                        ? setEditUser({ ...editUser, role: e.target.value })
                        : setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Personnel">Personnel</option>
                    <option value="PPGSHead">PPGS Head</option>
                    <option value="DeptHead">Department Head</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>

                {!editUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editUser ? handleEditUser : handleAddUser}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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