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
    approved: 0,
    rejected: 0,
  });

  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptHeadNeedsToNote, setDeptHeadNeedsToNote] = useState(false);

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

      // Check if any requests need to be noted by Dept Head
      const needsNote = requestsRes.data.some(r => !r.noted_by || r.noted_by === "Pending");
      setDeptHeadNeedsToNote(needsNote);

      const counts = {
        total: requestsRes.data.length,
        pending: requestsRes.data.filter((r) => r.status === "Pending").length,
        approved: requestsRes.data.filter((r) => r.status === "Approved").length,
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
      <AdminSidebar role="Admin" deptHeadHasRequests={deptHeadNeedsToNote} />

      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden"> {/* Updated background color and padding */}
        <header className="mb-6"> {/* Adjusted margin for consistency */}
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1> {/* Updated text size */}
          <p className="text-gray-700">
            Welcome, <span className="font-semibold text-blue-500">{user?.fullname}</span>!
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"> {/* Adjusted grid layout */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200"> {/* Updated card styling */}
            <p className="text-gray-600 font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center border border-gray-200">
            <p className="text-gray-600 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto pr-3"> {/* Added padding for scrollable section */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All User Requests</h2>

          <div className="space-y-4"> {/* Updated spacing for requests */}
            {allRequests.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Requester</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Date Filed</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Date Needed</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Description</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Noted By</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Approved By</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allRequests
                    .sort((a, b) => b.id - a.id) // Sort requests by ID in descending order
                    .map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800">{req.id}</td>
                        <td className="px-3 py-2 text-gray-800">{req.requested_by}</td>
                        <td className="px-3 py-2 text-gray-800">{formatDate(req.date_filed)}</td>
                        <td className="px-3 py-2 text-gray-800">{formatDate(req.date_needed)}</td>
                        <td className="px-3 py-2 text-gray-800">{req.type_of_concern}</td>
                        <td className="px-3 py-2 text-gray-800">{req.description}</td>
                        <td className="px-3 py-2 text-gray-800">{req.noted_by || "—"}</td>
                        <td className="px-3 py-2 text-gray-800">{req.approved_by || "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-white text-xs font-medium ${req.status === "Approved" ? "bg-green-500" : req.status === "Rejected" ? "bg-red-500" : "bg-yellow-600"}`}>
                            {req.status || "Pending"}
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
