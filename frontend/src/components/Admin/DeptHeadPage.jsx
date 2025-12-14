import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { 
  FaFileAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaTools, 
  FaAlignLeft, 
  FaCheckCircle,
  FaPlusCircle,
  FaClock,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaTimes,
  FaPaperPlane,
  FaSync,
  FaBuilding,
  FaSearch
} from "react-icons/fa";

const DeptHeadPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showNotedConfirm, setShowNotedConfirm] = useState(false);
  const [pendingNotedId, setPendingNotedId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [loading, setLoading] = useState(true);

  // Get the logged-in user's department from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // For DeptHead roles, extract department from role (e.g., "DeptHead-SBIT" -> "SBIT")
  let department = user.department;
  if (user.role && user.role.startsWith("DeptHead-")) {
    department = user.role.split("-")[1];
  }

  // Debug: log full user object
  console.log('[DEBUG] Full user object:', user);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/depthead/all-requests`);
      // Debug: log all departments in API response
      console.log('[DEBUG] API returned requests:', res.data.map(r => r.department));
      console.log('[DEBUG] Filtering for department:', department);
      const filtered = res.data.filter(req => req.department?.toLowerCase() === department?.toLowerCase());
      console.log('[DEBUG] Filtered requests:', filtered);
      setRequests(filtered.sort((a, b) => b.id - a.id));
      const uniqueDepartments = Array.from(new Set(filtered.map(r => r.department).filter(Boolean)));
      setDepartments(uniqueDepartments);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search term
  const filteredRequests = requests.filter(req => {
    // Filter by urgency if set
    if (urgencyFilter && req.urgency?.toLowerCase() !== urgencyFilter.toLowerCase()) {
      return false;
    }
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      return (
        (req.description && req.description.toLowerCase().includes(searchLower)) ||
        (req.requested_by && req.requested_by.toLowerCase().includes(searchLower)) ||
        (req.type_of_concern && req.type_of_concern.toLowerCase().includes(searchLower)) ||
        (req.id && req.id.toString().includes(searchTerm)) ||
        (req.reference_code && req.reference_code.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleNoted = (requestId) => {
    setPendingNotedId(requestId);
    setShowNotedConfirm(true);
  };

  const confirmNoted = async () => {
    if (!pendingNotedId) return;
    try {
      await axios.put(
        `http://localhost:5000/api/depthead/requests/${pendingNotedId}/noted`,
        { noted_by: user.fullname || "DeptHead" }
      );
      setRequests(prev => prev.filter(req => req.id !== pendingNotedId));
      setFeedbackMessage("Request marked as Noted.");
      setFeedbackType("success");
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (err) {
      console.error("Error updating noted_by:", err);
      setFeedbackMessage("Failed to save. Try again.");
      setFeedbackType("error");
    } finally {
      setShowNotedConfirm(false);
      setPendingNotedId(null);
    }
  };

  const cancelNoted = () => {
    setShowNotedConfirm(false);
    setPendingNotedId(null);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <AdminSidebar deptHeadHasRequests={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug: show current user department
  console.log('[DEBUG] DeptHeadPage user.department:', department);
  return (
    <div className="flex h-screen">
      <div className="relative h-screen">
        <AdminSidebar deptHeadHasRequests={requests.length > 0} />
      </div>
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto h-screen">
        {/* Noted Confirmation Modal */}
        {showNotedConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full border border-gray-200">
              <div className="flex items-center mb-4">
                <FaCheckCircle className="text-green-600 text-2xl mr-3" />
                <h2 className="text-lg font-bold text-gray-900">Confirm Noted</h2>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to mark this request as <span className="font-semibold text-green-700">Noted</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelNoted}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNoted}
                 className="px-5 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
                >
                  <FaCheckCircle className="mr-2" />
                  Yes, Noted
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Department Head Dashboard</h1>
                {requests.length > 0 && (
                  <span className="w-3 h-3 bg-white-500 rounded-full animate-ping" title="You have requests to review"></span>
                )}
              </div>
              <p className="text-gray-600 text-sm">Review and process facility repair requests from your department</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Search Box - Now placed before Refresh button */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search requests..."
                  className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={fetchRequests}
                className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`mb-6 p-4 rounded-xl border ${feedbackType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <div className="flex items-center">
              {feedbackType === "success" ? (
                <FaCheckCircle className="text-green-500 mr-3" />
              ) : (
                <FaExclamationTriangle className="text-red-500 mr-3" />
              )}
              <span className="font-medium">{feedbackMessage}</span>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">Awaiting Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{requests.length}</p>
              </div>
        
            
            </div>
          </div>
        </div>

        {/* Requests Alert */}
        {requests.length > 0 && (
          <div className="mb-6 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FaExclamationTriangle className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 text-sm">Action Required</h3>
                <p className="text-blue-700 text-sm">
                  You have <span className="font-bold">{requests.length}</span> request{requests.length > 1 ? "s" : ""} waiting for your review and approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Summary */}
        {searchTerm && filteredRequests.length > 0 && (
          <div className="mb-4 bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray-700">
              Showing <span className="font-semibold">{filteredRequests.length}</span> of <span className="font-semibold">{requests.length}</span> requests matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Urgency Filter - Dropdown Added */}
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white text-gray-700"
          >
            <option value="">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaFileAlt className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching requests found" : "No pending requests"}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {searchTerm 
                ? "Try adjusting your search"
                : "All requests have been processed or are awaiting prior endorsements."}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredRequests.map(req => (
              <div key={req.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-5 py-4 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FaFileAlt className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Request #{req.reference_code || req.id}</h3>
                        <p className="text-gray-600 text-xs mt-1">Awaiting department approval</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      Pending Review
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-700">
                        <div className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-black">Date Filed</p>
                          <p className="font-medium text-sm text-black">{formatDate(req.date_filed)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <div className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-black">Date Needed</p>
                          <p className="font-medium text-sm text-black">{formatDate(req.date_needed)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <div className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-black">Concern Type</p>
                          <p className="font-medium text-sm text-black">{req.type_of_concern}</p>
                        </div>
                      </div>
                     {/* Urgency Level */}
  <div className="flex items-center text-gray-700">
    <div className="mr-2">
      <div className={`w-1 h-1 rounded-full ${
        req.urgency === "Critical" ? "bg-white-500" :
        req.urgency === "High" ? "bg-white-500" :
        req.urgency === "Medium" ? "bg-white-500" :
        "bg-white-500"
      }`} />
    </div>
  <div>
    <p className="text-xs text-black">Urgency Level</p>
    <p className={`font-medium text-sm ${
      req.urgency === "Critical" ? "text-red-700" :
      req.urgency === "High" ? "text-orange-700" :
      req.urgency === "Medium" ? "text-yellow-700" :
      "text-green-700"
    }`}>
      {req.urgency || "—"}
    </p>
  </div>
</div>
                      
                      <div className="flex items-center text-gray-700">
                        <div className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-black">Requested By</p>
                          <p className="font-medium text-sm text-black">{req.requested_by}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <div className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-black">Department</p>
                          <p className="font-medium text-sm text-black">{req.department || department}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start text-gray-700">
                        <div className="text-gray-400 mr-2 mt-1" />
                        <div>
                          <p className="text-xs text-black">Description</p>
                          <p className="font-medium text-sm mt-1 text-black">{req.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <div className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-black">Current Status</p>
                        <p className="font-medium text-sm text-black">Awaiting department head approval</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <button
                      onClick={() => handleNoted(req.id)}
                      className="w-full flex items-center justify-center bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <div className="mr-2" />
                      Noted
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeptHeadPage;