import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

export default function PersonnelDashboard() {
  const [user, setUser] = useState(null);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // Static personnel options (same as AdminNotifications for mapping)
  const personnel = [
    { id: 1, fullname: "Personnel 1" },
    { id: 2, fullname: "Personnel 2" },
    { id: 3, fullname: "Personnel 3" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);
        // Fetch all requests that have an assigned personnel
        const res = await axios.get(
          `http://localhost:5000/api/requests?has_assigned=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Filter only requests with assigned_to not null
        setAssignedRequests(res.data.filter(r => r.assigned_to));
      } catch (err) {
        setAssignedRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to get personnel name by ID
  const getPersonnelName = (assignedToId) => {
    const person = personnel.find(p => p.id === parseInt(assignedToId));
    return person ? person.fullname : "Unassigned";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar role="Personnel" />
      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Personnel Dashboard</h1>
          <p className="text-gray-700">
            Welcome, <span className="font-semibold text-blue-500">{user?.fullname}</span>!
          </p>
        </header>
        <section className="flex-1 overflow-y-auto pr-3">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Assigned Requests</h2>
          {loading ? (
            <p className="p-4 text-gray-600">Loading...</p>
          ) : assignedRequests.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Requester</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignedRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 py-2">{req.id}</td>
                    <td className="px-3 py-2">{req.requested_by}</td>
                    <td className="px-3 py-2">{req.type_of_concern}</td>
                    <td className="px-3 py-2">{req.description}</td>
                    <td className="px-3 py-2">{req.status}</td>
                    <td className="px-3 py-2 text-green-700 font-semibold">
                      {getPersonnelName(req.assigned_to)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-gray-600">No assigned requests found.</p>
          )}
        </section>
      </div>
    </div>
  );
}