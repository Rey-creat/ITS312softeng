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
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: "",
    date_needed: "",
    type_of_concern: "",
    description: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) return navigate("/login");

      setUser(currentUser);

      const statsRes = await axios.get(
        `http://localhost:5000/api/dashboard-stats?user_id=${currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats({
        counts: statsRes.data.counts,
        recent: statsRes.data.recent,
      });
    } catch (err) {
      console.error(err);
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
  }, [location?.state?.refresh, navigate, location.pathname]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/requests/${id}`);
      alert("Request deleted successfully!");
      fetchDashboard();
    } catch (err) {
      alert("Failed to delete request!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${form.id}`, {
        date_needed: form.date_needed,
        type_of_concern: form.type_of_concern,
        description: form.description,
      });
      alert("Request updated successfully!");
      setEditing(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to update request!");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1 bg-gray-100 p-6 overflow-hidden">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
        </header>

        {/* Table Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left text-sm uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Reference Code</th>
                <th className="px-6 py-3 font-semibold">Date Filed</th>
                <th className="px-6 py-3 font-semibold">Date Needed</th>
                <th className="px-6 py-3 font-semibold">Concern</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length > 0 ? (
                stats.recent.map((req) => (
                  <tr
                    key={req.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-700">
                      {req.reference_code || `REQ-${req.id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(req.date_filed).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {req.date_needed}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {req.type_of_concern}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          req.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : req.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setForm({
                              id: req.id,
                              date_needed: req.date_needed,
                              type_of_concern: req.type_of_concern,
                              description: req.description,
                            });
                            setEditing(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-95">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 border border-gray-300">
              <h2 className="text-xl font-bold mb-4">Edit Request</h2>

              <label className="block mb-2 font-medium">Date Needed:</label>
              <input
                type="date"
                name="date_needed"
                value={form.date_needed}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />

              <label className="block mb-2 font-medium">Type of Concern:</label>
              <select
                name="type_of_concern"
                value={form.type_of_concern}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="Repair">Repair</option>
                <option value="Construction">Construction</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <label className="block mb-2 font-medium">Description:</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
