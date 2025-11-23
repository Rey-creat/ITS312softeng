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

  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!token || !currentUser?.id) {
        navigate("/login");
        return;
      }

      await axios.get("http://localhost:5000/api/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(currentUser);

      const requestsRes = await axios.get(
        "http://localhost:5000/api/requests?role=Admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllRequests(requestsRes.data);

      const counts = {
        total: requestsRes.data.length,
        pending: requestsRes.data.filter((r) => r.status === "Pending").length,
        completed: requestsRes.data.filter((r) => r.status === "Completed").length,
        rejected: requestsRes.data.filter((r) => r.status === "Rejected").length,
      };

      setStats(counts);
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
        <p className="text-xl font-medium text-gray-600 animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar role="Admin" />

      <div className="flex-1 bg-gray-50 p-4 flex flex-col overflow-hidden">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, <span className="font-semibold text-blue-500">{user?.fullname}</span>!
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white shadow rounded p-4 text-center border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Total Requests</p>
            <p className="text-2xl font-bold text-blue-500">{stats.total}</p>
          </div>

          <div className="bg-white shadow rounded p-4 text-center border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>

          <div className="bg-white shadow rounded p-4 text-center border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
          </div>

          <div className="bg-white shadow rounded p-4 text-center border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2 text-gray-800">All User Requests</h2>

          <div className="bg-white shadow rounded">
            {allRequests.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Requester</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Date Filed</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-800">{req.id}</td>
                      <td className="px-3 py-2 text-gray-800">{req.requested_by}</td>
                      <td className="px-3 py-2 text-gray-800">{req.type_of_concern}</td>
                      <td className="px-3 py-2 text-gray-800">{formatDate(req.date_filed)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded text-white text-xs font-medium ${{
                            Pending: "bg-yellow-400",
                            Completed: "bg-green-500",
                            Rejected: "bg-red-500",
                          }[req.status]}`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-gray-600">No requests found</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
