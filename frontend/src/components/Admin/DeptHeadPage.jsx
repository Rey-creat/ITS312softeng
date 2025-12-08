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
  FaBuilding
} from "react-icons/fa";

const DeptHeadPage = ({ department }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [notedBy, setNotedBy] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch requests for the specific department
      const res = await axios.get(`http://localhost:5000/api/depthead/all-requests?department=${department}`);
      // Only show requests where noted_by is null or 'Pending'
      const filtered = res.data.filter(req => !req.noted_by || req.noted_by === "Pending");
      setRequests(filtered.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotedBySubmit = async (e) => {
    e.preventDefault();
    if (!notedBy.trim()) {
      setFeedbackMessage("Please enter a name.");
      setFeedbackType("error");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/depthead/requests/${currentRequestId}/noted`,
        { noted_by: notedBy }
      );

      const updatedRequest = requests.find(req => req.id === currentRequestId);

      setRequests(prev => prev.filter(req => req.id !== currentRequestId));

      // Save array of noted requests
      const notedRequest = { ...updatedRequest, noted_by: notedBy };
      const existing = JSON.parse(localStorage.getItem("notedRequests")) || [];
      const updatedList = [...existing, notedRequest];
      localStorage.setItem("notedRequests", JSON.stringify(updatedList));

      setFeedbackMessage("Request noted successfully!");
      setFeedbackType("success");

      setShowModal(false);
      setNotedBy("");
      setCurrentRequestId(null);

      setTimeout(() => setFeedbackMessage(""), 3000);

    } catch (err) {
      console.error("Error updating noted_by:", err);
      setFeedbackMessage("Failed to save. Try again.");
      setFeedbackType("error");
    }
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
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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

  return (
    <div className="flex h-screen">
      <div className="relative h-screen">
        <AdminSidebar deptHeadHasRequests={requests.length > 0} />
      </div>
      <div className={`flex-1 p-6 bg-gray-100 overflow-y-auto h-screen ${showModal ? "blur-sm" : ""}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{department} Department Head Dashboard</h1>
                {requests.length > 0 && (
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" title="You have requests to review"></span>
                )}
              </div>
              <p className="text-gray-600 text-sm">Review and process facility repair requests from your department</p>
            </div>
            <div className="flex items-center space-x-3">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <FaFileAlt className="text-xl text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Request</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                <FaClock className="text-xl text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Awaiting Review</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{requests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Alert */}
        {requests.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
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

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaFileAlt className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600 text-sm mb-6">
              All requests have been processed or are awaiting prior endorsements.
            </p>
            <div className="text-xs text-gray-500">
              New requests will appear here when submitted by department members
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
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
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Date Filed</p>
                          <p className="font-medium text-sm">{formatDate(req.date_filed)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Date Needed</p>
                          <p className="font-medium text-sm">{formatDate(req.date_needed)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <FaTools className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Concern Type</p>
                          <p className="font-medium text-sm">{req.type_of_concern}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <FaUser className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Requested By</p>
                          <p className="font-medium text-sm">{req.requested_by}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start text-gray-700">
                        <FaAlignLeft className="text-gray-400 mr-2 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="font-medium text-sm mt-1">{req.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <FaClipboardCheck className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Current Status</p>
                        <p className="font-medium text-sm">Awaiting department head approval</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setCurrentRequestId(req.id);
                        setShowModal(true);
                      }}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <FaPlusCircle className="mr-2" />
                      Add Department Approval
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-300">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FaClipboardCheck className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Department Approval</h2>
                    <p className="text-gray-600 text-sm mt-1">Add your department endorsement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleNotedBySubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="flex items-center">
                    <FaBuilding className="mr-2 text-blue-500" />
                    Department Endorsement
                  </span>
                </label>
                <input
                  type="text"
                  value={notedBy}
                  onChange={(e) => setNotedBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-sm"
                  placeholder="Enter department name or your name..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will mark the request as approved by the department head
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center"
                  >
                    <FaCheckCircle className="mr-2" />
                    Approve Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptHeadPage;