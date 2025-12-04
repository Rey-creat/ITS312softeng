import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PersonnelDashboard() {
  const [user, setUser] = useState(null);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const personnel = [
    { id: 1, fullname: "Personnel 1" },
    { id: 2, fullname: "Personnel 2" },
    { id: 3, fullname: "Personnel 3" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);

        const res = await axios.get(
          `http://localhost:5000/api/requests?has_assigned=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAssignedRequests(res.data.filter((r) => r.assigned_to && r.assigned_to.trim() !== ""));
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setAssignedRequests([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const getPersonnelName = (assignedToId) => {
    const person = personnel.find((p) => p.id === parseInt(assignedToId));
    return person ? person.fullname : "Unassigned";
  };

  // Function to handle marking a request as done or rejected
  const handleMarkStatus = async (requestId, newStatus) => {
        if (!newStatus || typeof newStatus !== "string" || newStatus.trim() === "") {
          alert("Invalid status value. Please try again.");
          console.error("Attempted to update status with invalid value:", newStatus);
          return;
        }
    try {
      const token = localStorage.getItem("token");
      let body = { status: newStatus };
      if (newStatus === "Done") {
        // Set done_by to assigned_personnel_name or assigned_to
        const req = assignedRequests.find(r => r.id === requestId);
        body.done_by = req?.assigned_personnel_name || req?.assigned_to || "";
      }
      console.log("Updating request status", { requestId, ...body });
      const response = await axios.put(
        `http://localhost:5000/api/requests/${requestId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: newStatus, done_by: body.done_by || r.done_by } : r
        )
      );
      console.log("Status update response:", response.data);
      if (newStatus === "Done") {
        alert("Request marked as Done successfully!");
      }
    } catch (err) {
      if (err.response) {
        console.error("Error updating status (full response):", err.response);
        alert(`Error updating status: ${JSON.stringify(err.response.data)}`);
      } else {
        console.error("Error updating status (full error):", err);
        alert("Error updating status. See console for details.");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar role="Personnel" />

      <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Personnel Dashboard</h1>
          <p className="text-gray-700">
            Welcome,{" "}
            <span className="font-semibold text-blue-500">
              {user?.fullname}
            </span>
            !
          </p>
        </header>

        <section className="flex-1 overflow-y-auto pr-3">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Assigned Requests
          </h2>

          {loading ? (
            <p className="p-4 text-gray-600">Loading...</p>
          ) : assignedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {assignedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex flex-col justify-between"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Request Details</h2>
                  <div className="space-y-2 text-base mb-4">
                    <div>
                      <span className="font-semibold text-gray-500">Type:</span>
                      <span className="ml-2 text-gray-700">{req.type_of_concern || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Description:</span>
                      <span className="ml-2 text-gray-700">{req.description || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Requested By:</span>
                      <span className="ml-2 text-gray-700">{req.requested_by || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Date Filed:</span>
                      <span className="ml-2 text-gray-700">{req.date_filed || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Date Needed:</span>
                      <span className="ml-2 text-gray-700">{req.date_needed || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Assigned Personnel:</span>
                      <span className="ml-2 text-gray-700">{req.assigned_personnel_name || req.assigned_to || '-'}</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 mt-2">
                    {(req.status === "In Progress" || req.status === "Approved") && (
                      <button
                        onClick={() => handleMarkStatus(req.id, "Done")}
                        className="flex-1 border border-blue-500 text-blue-600 py-2 rounded-lg text-lg font-bold hover:bg-blue-50 transition bg-white cursor-pointer"
                      >
                        [ Done ]
                      </button>
                    )}
                    {req.status === "Done" && (
                      <button
                        disabled
                        className="flex-1 border border-green-500 text-green-600 py-2 rounded-lg text-lg font-bold bg-green-50 cursor-not-allowed"
                      >
                        [ Done ]
                      </button>
                    )}
                    {req.status === "Rejected" && (
                      <span className="flex-1 text-center text-red-600 text-lg font-bold">[ Rejected ]</span>
                    )}
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <p className="p-4 text-gray-600">No assigned requests found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
