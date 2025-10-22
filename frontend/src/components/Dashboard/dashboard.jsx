import React, { useEffect, useState } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ counts: { total: 0, pending: 0, completed: 0, rejected: 0 }, recent: [] });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ id: "", date_needed: "", type_of_concern: "", description: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) return navigate("/login");

      setUser(currentUser);

      const statsRes = await axios.get(`http://localhost:5000/api/dashboard-stats?user_id=${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({ counts: statsRes.data.counts, recent: statsRes.data.recent });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p>Welcome, <span className="font-semibold">{user.fullname}</span>!</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center"><p>Total Requests</p><p className="text-3xl font-bold">{stats.counts.total}</p></div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center"><p>Pending</p><p className="text-3xl font-bold text-yellow-600">{stats.counts.pending}</p></div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center"><p>Completed</p><p className="text-3xl font-bold text-green-600">{stats.counts.completed}</p></div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center"><p>Rejected</p><p className="text-3xl font-bold text-red-600">{stats.counts.rejected}</p></div>
        </section>

        {/* Recent Requests with Scroll */}
        <section className="flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Recent Requests</h2>
          <div className="space-y-4">
            {stats.recent.length > 0 ? stats.recent.map((req) => (
              <div key={req.id} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{req.type_of_concern}</p>
                  <p className="text-sm text-gray-500">Date Filed: {new Date(req.date_filed).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Date Needed: {req.date_needed}</p>
                  <p className="text-sm text-gray-500">Description: {req.description}</p>
                </div>
                <div className="flex items-center gap-2">
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
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(req.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            )) : <p>No recent requests</p>}
          </div>
        </section>

        {/* Edit Modal */}
        {editing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-96 border border-gray-300">
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
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Air Conditioning">Air Conditioning</option>
                <option value="Carpentry">Carpentry</option>
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
