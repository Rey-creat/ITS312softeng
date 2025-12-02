import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

export default function PersonnelDashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);
        // Fetch requests assigned to this personnel
        const res = await axios.get(
          `http://localhost:5000/api/requests?assigned_to=${currentUser?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequests(res.data);
      } catch (err) {
        setRequests([]);
        setFeedbackMessage("Error loading requests.");
        setFeedbackType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="flex h-screen">
      <AdminSidebar role="Personnel" />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Personnel</h1>
          <p className="text-gray-600 mt-2">
            Requests assigned to you. Only requests you are responsible for will appear here.
          </p>
        </div>

        {/* 🔔 Notification */}
        {feedbackMessage && (
          <div
            className={`p-4 mb-4 rounded border ${
              feedbackType === "success"
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading requests...
              </p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-lg font-medium">
              No requests assigned to you.
            </p>
            <p className="text-sm">
              All requests have been processed or are awaiting assignment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Request Details
                </h2>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Reference Code:
                    </span>
                    <span className="ml-2 text-blue-700 font-medium">
                      {req.reference_code || `REQ-${req.id}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Date Filed:
                    </span>
                    <span className="ml-2 text-gray-900">{formatDate(req.date_filed)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Date Needed:
                    </span>
                    <span className="ml-2 text-gray-900">{formatDate(req.date_needed) || "—"}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Requested By:
                    </span>
                    <span className="ml-2 text-gray-900">{req.requested_by}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Type of Concern:
                    </span>
                    <span className="ml-2 text-gray-900">{req.type_of_concern}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">
                      Description:
                    </span>
                    <span className="ml-2 text-gray-700">{req.description}</span>
                  </div>
                </div>
                {/* You can add action buttons here if needed */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
