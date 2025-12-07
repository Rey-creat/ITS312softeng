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
  FaSync
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
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/api/requests?role=Admin", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Filter only President-approved requests
                const filtered = res.data.filter(
                    r => r.status === "Approved"
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
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const handleAssignModal = async () => {
        if (!personnelName.trim()) {
            setError("Please enter personnel name.");
            return;
        }
        
        setAssigning((prev) => ({ ...prev, [modalRequestId]: true }));
        setError("");
        setSuccess("");
        
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:5000/api/requests/${modalRequestId}/assign`,
                { personnelName: personnelName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === modalRequestId
                        ? { ...r, assigned_to: personnelName.trim(), assigned_personnel_name: personnelName.trim() }
                        : r
                )
            );
            
            setFilteredRequests((prev) =>
                prev.map((r) =>
                    r.id === modalRequestId
                        ? { ...r, assigned_to: personnelName.trim(), assigned_personnel_name: personnelName.trim() }
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
            <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="fixed top-0 left-0 h-screen z-20">
                <AdminSidebar />
            </div>
            <div className="flex-1 ml-72 overflow-y-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                                                                        <FaBell className="text-xl text-white" />
                                                                </div>
                                                                <div className="flex items-center w-full">
                                                                    <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
                                                                    <span className="w-3 h-3 bg-red-500 rounded-full animate-ping inline-block ml-2" title="You have requests to review"></span>
                                                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">
                                Assign personnel to President-approved requests for action
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-green-50 text-green-800 rounded-lg border border-green-200 font-medium text-sm">
                                {filteredRequests.length} Requests Ready
                            </div>
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
                        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-green-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">President-Approved Requests</h2>
                                    <p className="text-gray-600 text-sm">
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Filed</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Needed</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Noted By</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">President Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assign Personnel</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredRequests
                                            .sort((a, b) => b.id - a.id)
                                            .map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                    {/* ID */}
                                                    <td className="px-5 py-4 text-sm">
                                                        <div className="font-bold text-blue-700">
                                                            REQ-{req.id}
                                                        </div>
                                                        {req.reference_code && (
                                                             <div className="text-xs text-gray-500">
                                                                {req.reference_code}
                                                                 </div>
                                                        )}
                                                    </td>
                                                    {/* Date Filed */}
                                                    <td className="px-5 py-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-gray-400" />
                                                            <span className="text-gray-700 font-medium">
                                                                {formatDate(req.date_filed)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Date Needed */}
                                                    <td className="px-5 py-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-gray-400" />
                                                            <span className={`font-medium ${
                                                                new Date(req.date_needed) < new Date() 
                                                                    ? "text-red-600" 
                                                                    : "text-gray-700"
                                                            }`}>
                                                                {formatDate(req.date_needed)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Type */}
                                                    <td className="px-5 py-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-gray-400" />
                                                            <span className="text-gray-700 font-medium">
                                                                {req.type_of_concern}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Description */}
                                                    <td className="px-5 py-4 max-w-xs text-sm">
                                                        <div className="flex items-start gap-2">
                                                            <div className="text-gray-400 mt-1" />
                                                            <p className="text-gray-700 line-clamp-2">
                                                                {req.description}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    {/* Requester */}
                                                    <td className="px-5 py-4 text-sm">
                                                        <span className="font-medium text-gray-900">
                                                            {req.requested_by}
                                                        </span>
                                                    </td>
                                                    {/* Noted By */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaClipboardCheck className="text-green-500" />
                                                            <span className="font-medium text-green-700">
                                                                {req.noted_by || "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* President Status */}
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                            <FaCheckCircle className="mr-1.5" />
                                                            {req.status || "Approved"}
                                                        </span>
                                                    </td>
                                                    {/* Assign Personnel */}
                                                    <td className="px-6 py-4">
                                                        {req.assigned_to ? (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                                        <FaUserPlus className="text-green-600 text-sm" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-green-700">
                                                                            {req.assigned_to}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            Assigned
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => openAssignModal(req.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                                >
                                                                    Reassign
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => openAssignModal(req.id)}
                                                                disabled={assigning[req.id]}
                                                                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {assigning[req.id] ? (
                                                                    <>
                                                                        <FaSync className="animate-spin" />
                                                                        Assigning...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaUserPlus />
                                                                        Assign Personnel
                                                                    </>
                                                                )}
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
            </div>

            {/* Assign Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-blue bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6">
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
                            
                            <div className="mb-6">
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleAssignModal()}
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignModal}
                                    disabled={assigning[modalRequestId]}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {assigning[modalRequestId] ? (
                                        <>
                                            <FaSync className="animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus />
                                            Assign Personnel
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}