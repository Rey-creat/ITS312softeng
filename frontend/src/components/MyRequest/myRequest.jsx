import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function MyRequest() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    counts: { total: 0, pending: 0, completed: 0, rejected: 0 },
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: "",
    date_filed: "",
    date_needed: "",
    type_of_concern: "",
    description: "",
  });

  // Format ISO → MM/DD/YYYY
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) return;

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request deleted successfully!");
      fetchDashboard();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      alert("Failed to delete request!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/requests/${form.id}`, {
        date_needed: form.date_needed,
        type_of_concern: form.type_of_concern,
        description: form.description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request updated successfully!");
      setEditing(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      alert("Failed to update request!");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Requests...
      </div>
    );

  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">

        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
        </header>

        {/* TABLE */}
        <div className="bg-white shadow-md rounded-lg overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left text-sm uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Reference Code</th>
                <th className="px-6 py-3 font-semibold">Date Filed</th>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">Date Needed</th>
                <th className="px-6 py-3 font-semibold">Concern</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length > 0 ? (
                stats.recent.map((req) => (
                  <tr key={req.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {req.reference_code || `REQ-${req.id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {formatShortDate(req.date_filed)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {formatShortDate(req.date_needed)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{req.type_of_concern}</td>
                    <td className="px-6 py-4 text-gray-700 break-words max-w-xs">
                      {req.description.split(" ").slice(0, 10).join(" ")}
                      {req.description.split(" ").length > 10 && "…"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                              date_filed: req.date_filed,
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
                  <td colSpan="7" className="text-center py-6 text-gray-500 italic">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* EDIT MODAL */}
        {editing && (
          <div className="fixed inset-0 flex items-center justify-center bg-blue bg-opacity-40 backdrop-blur-sm z-50 overflow-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg border border-gray-300">
              <h2 className="text-xl font-bold mb-4">Edit Request</h2>

              <div className="space-y-3">
                <div>
                  <label className="block mb-1 font-medium">Date Filed:</label>
                  <input
                    type="text"
                    value={formatShortDate(form.date_filed)}
                    readOnly
                    className="w-full border p-2 rounded bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Date Needed:</label>
                  <input
                    type="date"
                    name="date_needed"
                    value={form.date_needed}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Type of Concern:</label>
                  <select
                    name="type_of_concern"
                    value={form.type_of_concern}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="Repair">Repair</option>
                    <option value="Construction">Construction</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description:</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
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
