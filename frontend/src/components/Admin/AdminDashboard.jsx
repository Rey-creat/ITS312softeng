import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
  });
<<<<<<< HEAD
  const [allRequests, setAllRequests] = useState([]);
=======

  const [recentRequests, setRecentRequests] = useState([]);
>>>>>>> d596b285ca17b6e72507e3443e6cf6395f976905
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

<<<<<<< HEAD
      // Verify session
      if (!token || !currentUser?.id) {
        navigate("/login");
        return;
      }

      // Verify JWT session with backend
      await axios.get("http://localhost:5000/api/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(currentUser);

      // Fetch all requests (admin can see all)
      const requestsRes = await axios.get(
        "http://localhost:5000/api/requests?role=Admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllRequests(requestsRes.data);

      // Calculate stats from all requests
      const counts = {
        total: requestsRes.data.length,
        pending: requestsRes.data.filter((r) => r.status === "Pending").length,
        completed: requestsRes.data.filter((r) => r.status === "Completed").length,
        rejected: requestsRes.data.filter((r) => r.status === "Rejected").length,
      };
      setStats(counts);
=======
      // Dashboard stats
      const statsRes = await axios.get(
        "http://localhost:5000/api/dashboard-stats",
        { params: { user_id: userId } }
      );
      setStats(statsRes.data.counts);

      // ADMIN: fetch ALL requests
      const requestsRes = await axios.get(
        "http://localhost:5000/api/requests",
        { params: { role: "Admin" } }
      );
      setRecentRequests(requestsRes.data);

>>>>>>> d596b285ca17b6e72507e3443e6cf6395f976905
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
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
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );

  return (
<<<<<<< HEAD
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar role="Admin" />

      {/* Main content */}
      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-700">
            Welcome, <span className="font-semibold">{user?.fullname}</span>!
          </p>
        </header>

        {/* STATS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </section>

        {/* ALL USER REQUESTS TABLE - SCROLLABLE */}
        <section className="flex-1 overflow-y-auto pr-3">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All User Requests</h2>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {allRequests.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Requester</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Type of Concern</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date Filed</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{req.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{req.requested_by}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{req.type_of_concern}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(req.date_filed)}</td>
                      <td className="px-4 py-3 text-sm font-bold">
                        <span
                          className={`px-3 py-1 rounded-full text-white ${
                            req.status === "Pending"
                              ? "bg-yellow-500"
                              : req.status === "Completed"
                              ? "bg-green-600"
                              : req.status === "Rejected"
                              ? "bg-red-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {req.status}
                        </span>
=======
    <div className="flex h-screen">
      <AdminSidebar role="Admin" />

      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Total Requests</h2>
            <p className="text-3xl font-semibold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Pending</h2>
            <p className="text-3xl font-semibold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Completed</h2>
            <p className="text-3xl font-semibold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold">Rejected</h2>
            <p className="text-3xl font-semibold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* ALL REQUEST TABLE */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">All User Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Requester</th>
                  <th className="px-4 py-2">Type of Concern</th>
                  <th className="px-4 py-2">Date Filed</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length > 0 ? (
                  recentRequests.map((req) => (
                    <tr key={req.id} className="border-t">
                      <td className="px-4 py-2">{req.id}</td>
                      <td className="px-4 py-2">{req.requested_by}</td>
                      <td className="px-4 py-2">{req.type_of_concern}</td>
                      <td className="px-4 py-2">{req.date_filed}</td>
                      <td
                        className={`px-4 py-2 font-bold ${
                          req.status === "Pending"
                            ? "text-yellow-600"
                            : req.status === "Completed"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {req.status}
>>>>>>> d596b285ca17b6e72507e3443e6cf6395f976905
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-600">
                <p>No requests found</p>
              </div>
            )}
          </div>
<<<<<<< HEAD
        </section>
=======
        </div>

>>>>>>> d596b285ca17b6e72507e3443e6cf6395f976905
      </div>
    </div>
  );
}
