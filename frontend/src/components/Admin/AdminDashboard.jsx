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
      month: "long",
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
        <p className="text-2xl font-semibold text-gray-700">Loading Admin Dashboard...</p>
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar role="Admin" />

      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-700">
            Welcome, <span className="font-semibold">{user?.fullname}</span>!
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-lg text-gray-600 font-medium">Total Requests</p>
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-lg text-gray-600 font-medium">Pending</p>
            <p className="text-4xl font-bold text-yellow-500">{stats.pending}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-lg text-gray-600 font-medium">Completed</p>
            <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-lg text-gray-600 font-medium">Rejected</p>
            <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto pr-3">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">All User Requests</h2>

          <div className="bg-white shadow-md rounded-lg">
            {allRequests.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-300 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-lg font-semibold text-gray-900">ID</th>
                    <th className="px-4 py-3 text-lg font-semibold text-gray-900">Requester</th>
                    <th className="px-4 py-3 text-lg font-semibold text-gray-900">Type of Concern</th>
                    <th className="px-4 py-3 text-lg font-semibold text-gray-900">Date Filed</th>
                    <th className="px-4 py-3 text-lg font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-lg text-gray-800">{req.id}</td>
                      <td className="px-4 py-3 text-lg text-gray-800">{req.requested_by}</td>
                      <td className="px-4 py-3 text-lg text-gray-800">{req.type_of_concern}</td>
                      <td className="px-4 py-3 text-lg text-gray-800">{formatDate(req.date_filed)}</td>

                      <td className="px-4 py-3 text-lg font-bold">
                        <span
                          className={`px-3 py-1 rounded-full text-white ${
                            req.status === "Pending"
                              ? "bg-yellow-500"
                              : req.status === "Completed"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-gray-600 text-lg">No requests found</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
