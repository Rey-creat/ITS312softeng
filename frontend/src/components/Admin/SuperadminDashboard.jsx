import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar.jsx";
import axios from "axios";

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
  const [reorderId, setReorderId] = useState(null);
  const [assignId, setAssignId] = useState(null);
  const [assignPersonnel, setAssignPersonnel] = useState("");

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

  // User management handlers
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
    } catch (err) {}
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
    } catch (err) {}
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {}
  };

  // Assign request handler
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
    } catch (err) {}
  };

  // Reorder request handler
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
    } catch (err) {}
  };

  // Placeholder stats for Superadmin
  const stats = {
    counts: {
      total: requests.length,
      inProgress: requests.filter(
        (r) =>
          !r.done_by &&
          (!r.ppgshead || r.ppgshead !== "Rejected") &&
          (!r.status || r.status !== "Rejected")
      ).length,
      approved: requests.filter(
        (r) =>
          r.done_by &&
          (!r.ppgshead || r.ppgshead !== "Rejected") &&
          (!r.status || r.status !== "Rejected")
      ).length,
      rejected: requests.filter(
        (r) => r.ppgshead === "Rejected" || r.status === "Rejected"
      ).length,
    },
    recent: requests.slice().reverse().slice(0, 5),
  };

  return (
    <div className="flex min-h-screen bg-gradient-to from-gray-50 to-blue-50">
      <Sidebar
        role={currentUser?.role || "Superadmin"}
        fullname={currentUser?.fullname || "Superadmin"}
      />
      <div className="flex-1 h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Superadmin Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome,{" "}
                <span className="font-semibold text-blue-600">
                  {currentUser?.fullname || "Superadmin"}
                </span>
                ! Full system control.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {currentUser?.fullname
                  ? currentUser.fullname.charAt(0)
                  : "S"}
              </div>
            </div>
          </div>
        </div>
        {/* TABS */}
        <div
          style={{ marginBottom: "2rem", padding: "1rem 2rem 0 2rem" }}
          className=""
        >
          <button
            onClick={() => setActiveTab("requests")}
            className={
              activeTab === "requests" ? "tab-active" : "tab"
            }
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "tab-active" : "tab"}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={activeTab === "reports" ? "tab-active" : "tab"}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={activeTab === "logs" ? "tab-active" : "tab"}
          >
            Logs
          </button>
        </div>
        {/* STATS CARDS */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            System Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Total Requests
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.counts.total}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                In Progress
              </h3>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.counts.inProgress}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.counts.approved}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Rejected</h3>
              <p className="text-2xl font-bold text-red-600">
                {stats.counts.rejected}
              </p>
            </div>
          </div>
        </div>
        {/* TAB CONTENTS */}
        <div className="px-6 pb-10">
          {activeTab === "requests" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">All Requests</h2>
              <p className="text-gray-600 mb-4">View, assign, reorder, or override any request here.</p>
              {loading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : requests.length > 0 ? (
                <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">ID</th>
                      <th className="px-4 py-2 border-b">Type</th>
                      <th className="px-4 py-2 border-b">Status</th>
                      <th className="px-4 py-2 border-b">Assigned To</th>
                      <th className="px-4 py-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice().sort((a, b) => b.id - a.id).map((req) => (
                      <tr key={req.id} className="border-b">
                        <td className="px-4 py-2">{req.id}</td>
                        <td className="px-4 py-2">{req.type_of_concern}</td>
                        <td className="px-4 py-2">{req.status || (req.done_by ? "Approved" : "In Progress")}</td>
                        <td className="px-4 py-2">{req.assigned_to || "Unassigned"}</td>
                        <td className="px-4 py-2">
                          <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2" onClick={() => { setAssignId(req.id); }}>Assign</button>
                          <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleReorderRequest(req.id, "up")}>Up</button>
                          <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleReorderRequest(req.id, "down")}>Down</button>
                          <button className="bg-red-500 text-white px-2 py-1 rounded">Override</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">No requests found.</div>
              )}
              {/* Assign Modal */}
              {assignId && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="bg-white p-6 rounded shadow-lg w-96">
                    <h3 className="text-lg font-bold mb-4">Assign Request #{assignId}</h3>
                    <label className="block mb-2">Personnel Name:</label>
                    <input type="text" className="w-full border px-3 py-2 rounded mb-4" value={assignPersonnel} onChange={e => setAssignPersonnel(e.target.value)} placeholder="Enter personnel name" />
                    <div className="flex justify-end space-x-2">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAssignRequest} disabled={!assignPersonnel}>Assign</button>
                      <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setAssignId(null); setAssignPersonnel(""); }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "users" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                User Management
              </h2>
              <p className="text-gray-600 mb-4">
                Add, edit, delete users, and change roles.
              </p>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-4"
                onClick={() => {
                  setShowUserModal(true);
                  setEditUser(null);
                }}
              >
                Add User
              </button>
              {loading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : users.length > 0 ? (
                <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">ID</th>
                      <th className="px-4 py-2 border-b">Full Name</th>
                      <th className="px-4 py-2 border-b">Email</th>
                      <th className="px-4 py-2 border-b">Role</th>
                      <th className="px-4 py-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-4 py-2">{user.id}</td>
                        <td className="px-4 py-2">{user.fullname}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.role}</td>
                        <td className="px-4 py-2">
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            onClick={() => {
                              setEditUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">No users found.</div>
              )}
              {/* User Modal */}
              {showUserModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="bg-white p-6 rounded shadow-lg w-96">
                    <h3 className="text-lg font-bold mb-4">
                      {editUser ? "Edit User" : "Add User"}
                    </h3>
                    <label className="block mb-2">Full Name:</label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded mb-2"
                      value={editUser ? editUser.fullname : newUser.fullname}
                      onChange={(e) =>
                        editUser
                          ? setEditUser({ ...editUser, fullname: e.target.value })
                          : setNewUser({ ...newUser, fullname: e.target.value })
                      }
                    />
                    <label className="block mb-2">Email:</label>
                    <input
                      type="email"
                      className="w-full border px-3 py-2 rounded mb-2"
                      value={editUser ? editUser.email : newUser.email}
                      onChange={(e) =>
                        editUser
                          ? setEditUser({ ...editUser, email: e.target.value })
                          : setNewUser({ ...newUser, email: e.target.value })
                      }
                    />
                    <label className="block mb-2">Role:</label>
                    <select
                      className="w-full border px-3 py-2 rounded mb-2"
                      value={editUser ? editUser.role : newUser.role}
                      onChange={(e) =>
                        editUser
                          ? setEditUser({ ...editUser, role: e.target.value })
                          : setNewUser({ ...newUser, role: e.target.value })
                      }
                    >
                      <option value="Personnel">Personnel</option>
                      <option value="PPGSHead">PPGSHead</option>
                      <option value="DeptHead">DeptHead</option>
                      <option value="Superadmin">Superadmin</option>
                    </select>
                    {!editUser && (
                      <>
                        <label className="block mb-2">Password:</label>
                        <input
                          type="password"
                          className="w-full border px-3 py-2 rounded mb-2"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                        />
                      </>
                    )}
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={editUser ? handleEditUser : handleAddUser}
                      >
                        {editUser ? "Save" : "Add"}
                      </button>
                      <button
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => {
                          setShowUserModal(false);
                          setEditUser(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "reports" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">System Reports</h2>
              <p className="text-gray-600 mb-4">Quick summary of requests.</p>
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <ul className="space-y-2">
                  <li>Total Requests: <span className="font-bold">{stats.counts.total}</span></li>
                  <li>Approved Requests: <span className="font-bold text-green-600">{stats.counts.approved}</span></li>
                  <li>Rejected Requests: <span className="font-bold text-red-600">{stats.counts.rejected}</span></li>
                  <li>In Progress: <span className="font-bold text-yellow-600">{stats.counts.inProgress}</span></li>
                </ul>
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Recent Requests</h3>
                  <ul className="list-disc pl-5">
                    {stats.recent.map(r => (
                      <li key={r.id}>
                        #{r.id} - {r.type_of_concern} ({r.status || (r.done_by ? "Approved" : "In Progress")})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {activeTab === "logs" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">System Logs</h2>
              <p className="text-gray-600 mb-4">Recent system actions.</p>
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <ul className="space-y-2">
                  {requests.slice().sort((a, b) => b.id - a.id).slice(0, 10).map(r => (
                    <li key={r.id}>
                      Request #{r.id} - {r.type_of_concern}: <span className="font-semibold">{r.status || (r.done_by ? "Approved" : "In Progress")}</span> by {r.done_by || r.assigned_to || "Unknown"}
                    </li>
                  ))}
                  {users.slice().sort((a, b) => b.id - a.id).slice(0, 5).map(u => (
                    <li key={u.id}>
                      User {u.fullname} ({u.role}) - Added/Edited
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <style>{`
          .tab {
            padding: 0.5rem 1.5rem;
            margin-right: 1rem;
            border: none;
            background: #e0e7ff;
            color: #333;
            border-radius: 6px;
            cursor: pointer;
          }
          .tab-active {
            padding: 0.5rem 1.5rem;
            margin-right: 1rem;
            border: none;
            background: #2563eb;
            color: #fff;
            border-radius: 6px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(37,99,235,0.15);
          }
        `}</style>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
