import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    counts: { total: 0, pending: 0, completed: 0, rejected: 0 },
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Convert ISO date → Month Day, Year
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

      const statsRes = await axios.get(
        `http://localhost:5000/api/dashboard-stats?user_id=${currentUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats({
        counts: statsRes.data.counts,
        recent: statsRes.data.recent,
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
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-700">
            Welcome, <span className="font-semibold">{user.fullname}</span>!
          </p>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{stats.counts.total}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.counts.pending}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.counts.completed}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{stats.counts.rejected}</p>
          </div>
        </section>

        {/* RECENT REQUESTS — SCROLLABLE */}
        <section className="flex-1 overflow-y-auto pr-3">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Requests</h2>

          <div className="space-y-4">
            {stats.recent.length > 0 ? (
              stats.recent.map((req) => (
                <div
                  key={req.id}
                  className="bg-white shadow-lg rounded-lg p-5 border border-gray-200"
                >
                  <p className="font-bold text-lg text-gray-900 mb-1">
                    {req.type_of_concern}
                  </p>

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
              ))
            ) : (
              <p className="text-gray-600">No recent requests</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
