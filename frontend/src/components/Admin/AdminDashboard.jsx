import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("[DEBUG] Fetching dashboard stats...");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || 1;

      // Dashboard stats
      const statsRes = await axios.get(
        "http://localhost:5000/api/dashboard-stats",
        { params: { user_id: userId } }
      );
      console.log("[DEBUG] Stats response:", statsRes.data);

      setStats(statsRes.data.counts);

      // ADMIN — fetch ALL requests
      const requestsRes = await axios.get(
        "http://localhost:5000/api/requests",
        { params: { role: "Admin" } }
      );
      console.log("[DEBUG] Requests response:", requestsRes.data);

      // ✅ SORT IDs ASCENDING (12, 25, 30, 37, 40…)
      const sortedRequests = requestsRes.data.sort((a, b) => a.id - b.id);

      setRecentRequests(sortedRequests);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
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
        Loading Admin Dashboard...
      </div>
    );

  return (
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
