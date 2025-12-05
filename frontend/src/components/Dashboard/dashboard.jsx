import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    counts: { total: 0, inProgress: 0, approved: 0, rejected: 0 },
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [previousTotal, setPreviousTotal] = useState(0); // Track previous total requests
  const navigate = useNavigate();
  const location = useLocation();

  // Convert ISO date → Month Day, Year
  // Format YYYY-MM-DD to Month Day, Year (local, no timezone conversion)
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
      // Calculate counts
      const total = allRequests.length;
      const inProgress = allRequests.filter(r => !r.done_by && (!r.ppgshead || r.ppgshead !== "Rejected") && (!r.status || r.status !== "Rejected")).length;
      const approved = allRequests.filter(r => r.done_by && (!r.ppgshead || r.ppgshead !== "Rejected") && (!r.status || r.status !== "Rejected")).length;
      const rejected = allRequests.filter(r => r.ppgshead === "Rejected" || r.status === "Rejected").length;
      // Recent requests (last 5)
      const recent = allRequests.slice(0, 5);
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
        totalElement.classList.add("text-blue-600"); // Add blue color
        setTimeout(() => {
          totalElement.classList.remove("text-blue-600"); // Remove blue color after 2 seconds
        }, 2000);
      }
    }
    setPreviousTotal(stats.counts.total);
  }, [stats.counts.total]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role} />

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-700">
            Welcome, <span className="font-semibold">{user.fullname}</span>!
          </p>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6 flex items-center border border-gray-200">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4 text-center">
              <p className="text-gray-600 font-medium">Total Requests</p>
              <p id="total-requests" className="text-3xl font-bold text-gray-900">{stats.counts.total}</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 flex items-center border border-gray-200">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4 text-center">
              <p className="text-gray-600 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.counts.inProgress}</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 flex items-center border border-gray-200">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4 text-center">
              <p className="text-gray-600 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.counts.approved}</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 flex items-center border border-gray-200">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4 text-center">
              <p className="text-gray-600 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.counts.rejected}</p>
            </div>
          </div>
        </section>

        {/* RECENT REQUESTS — SCROLLABLE */}
        <section className="flex-1 overflow-y-auto pr-3">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Recent Requests
          </h2>

          <div className="space-y-4">
            {stats.recent.length > 0 ? (
              stats.recent.map((req) => {
                // Determine status: Approved if done_by and not rejected, In Progress if not done_by and not rejected, Rejected if ppgshead or status is Rejected
                let statusLabel = "In Progress";
                let statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                if (req.ppgshead === "Rejected" || req.status === "Rejected") {
                  statusLabel = "Rejected";
                  statusColor = "bg-red-100 text-red-800 border-red-200";
                } else if (req.done_by) {
                  statusLabel = "Approved";
                  statusColor = "bg-green-100 text-green-800 border-green-200";
                }
                return (
                  <div
                    key={req.id}
                    className="bg-white shadow-lg rounded-lg p-5 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-lg text-gray-900">
                        {req.type_of_concern}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Date Filed:</span>{" "}
                      {formatDate(req.date_filed)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Date Needed:</span>{" "}
                      {formatDate(req.date_needed)}
                    </p>
                    <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                      <span className="font-semibold">Description:</span>{" "}
                      {req.description}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">No recent requests</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
