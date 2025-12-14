import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  FaBell,
  FaUser,
  FaTools,
  FaAlignLeft,
  FaCalendarAlt,
  FaCalendarDay,
  FaClipboardCheck,
  FaCheckCircle,
  FaHourglassHalf,
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaArrowRight,
  FaExclamationCircle,
  FaCheck,
  FaTimes,
  FaSync,
  FaHardHat
} from "react-icons/fa";

export default function AdminNotifications() {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalRequestId, setModalRequestId] = useState(null);
    const [personnelName, setPersonnelName] = useState("");
    const [personnelRole, setPersonnelRole] = useState("Carpentry"); // Default role
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Role options for dropdown
    const roleOptions = ["Carpentry", "Aircon Technician", "Plumbing", "Electrical"];

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/api/requests?role=Admin", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Show all president-approved requests, even if assigned
                const filtered = res.data.filter(
                    r => r.status === "Approved" || r.status === "Done"
                );

                setRequests(filtered);
                setFilteredRequests(filtered);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                    setTimeout(() => navigate("/login"), 2000);
                } else {
                    setError("Error fetching requests. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [navigate]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredRequests(requests);
            return;
        }
        
        const searchLower = searchTerm.toLowerCase();
        const filtered = requests.filter(req => 
            req.requested_by?.toLowerCase().includes(searchLower) ||
            req.type_of_concern?.toLowerCase().includes(searchLower) ||
            req.description?.toLowerCase().includes(searchLower) ||
            req.noted_by?.toLowerCase().includes(searchLower) ||
            req.id.toString().includes(searchLower)
        );
        setFilteredRequests(filtered);
    }, [searchTerm, requests]);

    // Helper to check if reassign should be disabled
    const isReassignDisabled = (req) => req.status === 'Done';

    // Helper to check if Mark as Done should be disabled
    const isMarkDoneDisabled = (req) => {
        // Disable if:
        // 1. Status is already 'Done'
        // 2. No personnel is assigned
        // 3. Personnel name is empty
        return req.status === 'Done' || !req.assigned_to || req.assigned_to.trim() === '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const openAssignModal = (requestId) => {
        setModalRequestId(requestId);
        setPersonnelName("");
        setPersonnelRole("Carpentry"); // Reset to default
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const handleAssignModal = async () => {
        if (!personnelName.trim()) {
            setError("Please enter personnel name.");
            return;
        }
        
        if (!personnelRole.trim()) {
            setError("Please select a role.");
            return;
        }
        
        setAssigning((prev) => ({ ...prev, [modalRequestId]: true }));
        setError("");
        setSuccess("");
        
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:5000/api/requests/${modalRequestId}/assign`,
                { 
                    personnelName: personnelName.trim(),
                    personnelRole: personnelRole.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update the request with both name and role
            const updatedRequest = {
                assigned_to: personnelName.trim(),
                assigned_role: personnelRole.trim(),
                assigned_personnel_name: personnelName.trim()
            };
            
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === modalRequestId
                        ? { ...r, ...updatedRequest }
                        : r
                )
            );
            
            setFilteredRequests((prev) =>
                prev.map((r) =>
                    r.id === modalRequestId
                        ? { ...r, ...updatedRequest }
                        : r
                )
            );
            
            setSuccess("Personnel assigned successfully!");
            setTimeout(() => setSuccess(""), 3000);
            setShowModal(false);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error assigning personnel.";
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(errorMsg);
            }
        }
        
        setAssigning((prev) => ({ ...prev, [modalRequestId]: false }));
    };


    const handleMarkAsDone = async (requestId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/api/requests/${requestId}`,
                { status: "Done", done_by: "Admin" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests((prev) =>
                prev.map((req) =>
                    req.id === requestId ? { ...req, status: "Done" } : req
                )
            );
            setFilteredRequests((prev) =>
                prev.map((req) =>
                    req.id === requestId ? { ...req, status: "Done" } : req
                )
            );
            showNotification("Request marked as done.", "success");
        } catch (err) {
            console.error("Error marking request as done", err);
            showNotification("Failed to mark request as done.", "error");
        }
    };

    const handleAssignPersonnel = async (requestId, personnelName) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/api/requests/${requestId}/assign`,
                { assigned_to: personnelName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests((prev) =>
                prev.map((req) =>
                    req.id === requestId ? { ...req, assigned_to: personnelName } : req
                )
            );
            alert("Personnel assigned successfully.");
        } catch (err) {
            console.error("Error assigning personnel", err);
            alert("Failed to assign personnel.");
        }
    };

    const showNotification = (message, type = "success") => {
        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${
            type === "success" ? "bg-green-600" : "bg-red-600"
        } text-white flex items-center`;
        
        notification.innerHTML = `
            ${type === "success" ? 
                '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' :
                '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
            }
            ${message}
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateX(100%)";
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading notifications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50 overflow-hidden">
            <div className="fixed top-0 left-0 h-screen z-20">
                <AdminSidebar />
            </div>
            <div className="flex-1 ml-72">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
                            <p className="text-gray-600 text-sm">
                                Assign personnel to requester approved requests for action
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="px-4 py-2 bg-green-50 text-green-800 rounded-lg border border-green-200 font-medium text-sm">
                                    {filteredRequests.length} Requests Ready
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <FaSync className="mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Stats */}
                <div className="px-6 py-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search requests by ID, requester, type, or description..."
                                className="pl-10 pr-4 py-3 w-full md:w-96 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg font-medium text-sm">
                                Total: {requests.length}
                            </div>
                            <div className="px-4 py-2 bg-green-50 text-green-800 rounded-lg font-medium text-sm">
                                Pending Assignment: {filteredRequests.filter(r => !r.assigned_to).length}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-green-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">PPGS-Approved Requests</h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Ready for personnel assignment and implementation
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <FaCheckCircle />
                                    <span className="font-medium text-sm">Fully Approved</span>
                                </div>
                            </div>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                                    <FaCheckCircle className="text-3xl text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? "No matching requests found" : "All requests have been assigned"}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {searchTerm ? "Try a different search term" : "No pending assignments at the moment"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[60vh] min-h-[300px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Filed</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Needed</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Urgency</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Noted By</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">President Status</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Personnel</th>
                                            <th className="px-0.5 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredRequests
                                            .sort((a, b) => b.id - a.id)
                                            .map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                    <td className="px-0.5 py-1 text-xs font-bold text-blue-700">REQ-{req.id}</td>
                                                    <td className="px-0.5 py-1 text-xs text-gray-700">{formatDate(req.date_filed)}</td>
                                                    <td className={`px-0.5 py-1 text-xs font-medium ${new Date(req.date_needed) < new Date() ? "text-red-600" : "text-gray-700"}`}>{formatDate(req.date_needed)}</td>
                                                    <td className="px-0.5 py-1 text-xs text-gray-700 font-medium">{req.type_of_concern}</td>
                                                    <td className="px-0.5 py-1 text-xs text-gray-700 font-medium">{req.urgency}</td>
                                                    <td className="px-0.5 py-1 text-xs text-gray-700">{req.description}</td>
                                                    <td className="px-0.5 py-1 text-xs font-medium text-gray-900">{req.requested_by}</td>
                                                    <td className="px-0.5 py-1 font-medium text-green-700">{req.noted_by || "—"}</td>
                                                    <td className="px-0.5 py-1">
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                            <div className="mr-1" />
                                                            Approved
                                                        </span>
                                                    </td>
                                                    <td className="px-0.5 py-1 min-w-[100px] text-center">
                                                        {req.status === 'Done' ? (
                                                            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-green-200 text-green-800 border border-green-300">
                                                                Done
                                                            </span>
                                                        ) : req.assigned_to ? (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-green-600 text-sm" />
                                                                    <span className="font-medium text-green-700 text-sm">{req.assigned_to}</span>
                                                                </div>
                                                                {req.assigned_role && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-blue-600 text-sm" />
                                                                        <span className="text-xs text-gray-600 font-medium">{req.assigned_role}</span>
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        if (!isReassignDisabled(req)) openAssignModal(req.id);
                                                                    }}
                                                                    className={`px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed ${isReassignDisabled(req) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    disabled={isReassignDisabled(req)}
                                                                >
                                                                    Reassign
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    if (!isReassignDisabled(req)) openAssignModal(req.id);
                                                                }}
                                                                disabled={assigning[req.id] || isReassignDisabled(req)}
                                                                className={`px-4 py-2 text-sm font-small text-white bg-blue-600 hover:bg-blue-700 rounded-lg 
                                                                    transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isReassignDisabled(req) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {assigning[req.id] ? (
                                                                    <>
                                                                        <FaSync className="animate-spin" />
                                                                        Assigning...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div />
                                                                        Assign Personnel
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        {req.status === 'Done' ? (
                                                            <button
                                                                className="px-2 py-2 text-sm font-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                                                disabled
                                                            >
                                                                Completed
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleMarkAsDone(req.id)}
                                                                disabled={isMarkDoneDisabled(req)}
                                                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isMarkDoneDisabled(req) ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                            >
                                                                {isMarkDoneDisabled(req) ? 'Done' : 'Mark as Done'}
                                                            </button>
                                                        )}  
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                {/* Modal for Assign Personnel */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-blue bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Assign Personnel</h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Request #{modalRequestId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                                    <FaExclamationCircle />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2">
                                    <FaCheck />
                                    {success}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Personnel Name
                                    </label>
                                    <input
                                        type="text"
                                        value={personnelName}
                                        onChange={(e) => setPersonnelName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Enter personnel name"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={personnelRole}
                                        onChange={(e) => setPersonnelRole(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        {roleOptions.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignModal}
                                    disabled={assigning[modalRequestId]}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {assigning[modalRequestId] ? (
                                        <>
                                            <FaSync className="animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>  
                                            <div />
                                            Assign Personnel
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}