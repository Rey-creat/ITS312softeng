import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFilter,
  FaSearch,
  FaEye,
  FaFileAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaLock,
  FaUserTie,
  FaUserCheck,
  FaUserShield
} from "react-icons/fa";

export default function MyRequest() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    counts: { total: 0, pending: 0, completed: 0, rejected: 0 },
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: "",
    date_filed: "",
    date_needed: "",
    type_of_concern: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Format YYYY-MM-DD to Month Day, Year
  const formatShortDate = (dateString) => {
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

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) return;

      setUser(currentUser);

      const statsRes = await axios.get(
        `http://localhost:5000/api/dashboard-stats?user_id=${currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats({
        counts: statsRes.data.counts,
        recent: statsRes.data.recent,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Check if request can be edited/deleted
  const canEditDelete = (request) => {
    // Cannot edit/delete if:
    // 1. Department head has noted it (and not "Pending")
    if (request.noted_by && request.noted_by !== "" && request.noted_by !== "Pending") {
      return false;
    }
    // 2. PPGS Head has processed it
    if (request.ppgshead === "Approved" || request.ppgshead === "Rejected") {
      return false;
    }
    // 3. President has processed it
    if (request.status === "Approved" || request.status === "Rejected" || request.status === "Done") {
      return false;
    }
    // 4. Admin has marked it as done
    if (request.done_by) {
      return false;
    }
    return true;
  };

  // Get lock reason message
  const getLockReason = (request) => {
    if (request.noted_by && request.noted_by !== "" && request.noted_by !== "Pending") {
      return `Locked - Noted by Department Head (${request.noted_by})`;
    }
    if (request.ppgshead === "Approved") {
      return "";
    }
    if (request.ppgshead === "Rejected") {
      return "";
    }
    if (request.status === "Approved") {
      return "Locked - Approved by President";
    }
    if (request.status === "Rejected") {
      return "Locked - Rejected by President";
    }
    if (request.status === "Done") {
      return "Locked - Completed by Admin";
    }
    if (request.done_by) {
      return `Locked - Marked as done by Admin (${request.done_by})`;
    }
    return "";
  };

  const handleDelete = async (id) => {
    const request = stats.recent.find(r => r.id === id);
    
    if (!canEditDelete(request)) {
      const reason = getLockReason(request);
      alert(`Cannot delete this request. ${reason}`);
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request deleted successfully!");
      fetchDashboard();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      alert("Failed to delete request!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const request = stats.recent.find(r => r.id === form.id);
    
    if (!canEditDelete(request)) {
      const reason = getLockReason(request);
      alert(`Cannot edit this request. ${reason}`);
      setEditing(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/requests/${form.id}`,
        {
          date_needed: form.date_needed,
          type_of_concern: form.type_of_concern,
          description: form.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Request updated successfully!");
      setEditing(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      alert("Failed to update request!");
    }
  };

  // Get status color
  const getStatusColor = (req) => {
    const isStrictApproved = req.ppgshead === "Approved" && req.status === "Approved";
    if (req.ppgshead === "Rejected" || req.status === "Rejected") return "bg-red-100 text-red-800";
    if (isStrictApproved) return "bg-green-100 text-green-800";
    if (req.ppgshead === "Approved" || req.noted_by) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (req) => {
    const isStrictApproved = req.ppgshead === "Approved" && req.status === "Approved";
    if (req.ppgshead === "Rejected" || req.status === "Rejected") return "Rejected";
    if (isStrictApproved) return "Approved";
    if (req.ppgshead === "Approved" || req.noted_by) return "In Progress";
    return "Pending";
  };

  // Get status icon
  const getStatusIcon = (req) => {
    const isLocked = !canEditDelete(req);
    if (isLocked) return <FaLock className="inline-block mr-1 text-gray-500" />;
    if (req.ppgshead === "Rejected" || req.status === "Rejected") return <FaTimes className="inline-block mr-1 text-red-600" />;
    if (req.ppgshead === "Approved" && req.status === "Approved") return <FaCheckCircle className="inline-block mr-1 text-green-600" />;
    if (req.ppgshead === "Approved" || req.noted_by) return <FaUserCheck className="inline-block mr-1 text-blue-600" />;
    return <FaClock className="inline-block mr-1 text-yellow-600" />;
  };

  // Filter requests by ID
  const filteredRequests = stats.recent.filter(req => {
    if (searchTerm) {
      return req.id.toString().includes(searchTerm) || 
             (req.reference_code && req.reference_code.includes(searchTerm));
    }
    return true;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your requests...</p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="fixed top-0 left-0 h-screen z-20">
        <Sidebar role={user?.role} fullname={user?.fullname} />
      </div>
      <div className="flex-1 ml-72 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="text-3xl text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-1" />
              <div>
                <p className="text-gray-700 font-medium mb-1">Request Locking Policy</p>
                <p className="text-gray-600 text-sm">
                  Once a request has been noted by the department head, approved/rejected by PPGS Head or President, 
                  or marked as done by Admin, it cannot be edited or deleted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
       
          <div className="flex items-center">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests by Id ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
        
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request List</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredRequests.length} of {stats.recent.length} requests
                </p>
              </div>
              <div className="text-sm text-gray-500">
                
              </div>
            </div>
          </div>
          
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Filed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Needed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Concern</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((req) => {
                    const isLocked = !canEditDelete(req);
                    const lockReason = getLockReason(req);
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-blue-700">
                          <div className="flex items-center">
                            <div className="text-blue-600 mr-2" /> 
                            <span>{req.reference_code || `REQ-${req.id}`}</span>
                            {isLocked && <div className="ml-2 text-gray-400" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-2" />
                            {formatShortDate(req.date_filed)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-2" />
                            {formatShortDate(req.date_needed)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {req.type_of_concern}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {req.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (isLocked) {
                                  alert(`Cannot edit this request. ${lockReason}`);
                                  return;
                                }
                                setForm({
                                  id: req.id,
                                  date_filed: req.date_filed,
                                  date_needed: req.date_needed,
                                  type_of_concern: req.type_of_concern,
                                  description: req.description,
                                });
                                setEditing(true);
                              }}
                              disabled={isLocked}
                              className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                isLocked
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200'
                              }`}
                              title={isLocked ? lockReason : "Edit request"}
                            >
                              <div className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              disabled={isLocked}
                              className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                isLocked
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200'
                              }`}
                              title={isLocked ? lockReason : "Delete request"}
                            >
                              <div className="mr-2" />
                              Delete
                            </button>
                          </div>
                          {isLocked && (
                            <div className="text-xs text-gray-500 mt-2 flex items-center">
                              <div className="mr-1" />
                              {lockReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaFileAlt className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "You haven't submitted any requests yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-300">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <FaEdit className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Edit Request</h2>
                    <p className="text-gray-600 text-sm">Update your request details</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <div className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Date Filed:</label>
                  <input
                    type="text"
                    value={formatShortDate(form.date_filed)}
                    readOnly
                    className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Date Needed:</label>
                  <input
                    type="date"
                    name="date_needed"
                    value={form.date_needed}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-700">Type of Concern:</label>
                  <select
                    name="type_of_concern"
                    value={form.type_of_concern}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Repair">Repair</option>
                    <option value="Construction">Construction</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Installation">Installation</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-700">Description:</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center"
                >
                  <div className="mr-2" />
                  Save Changes
                </button> 
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}