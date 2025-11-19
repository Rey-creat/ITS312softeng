import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar"; // adjust path
import axios from "axios";

const PPGSHeadPage = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("Pending");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    // Fetch approved requests from the backend
    axios
      .get("/api/ppgshead/approved-requests")
      .then((response) => {
        console.log("API Response:", response.data); // Debug API response
        setApprovedRequests(Array.isArray(response.data) ? response.data : []); // Ensure array
      })
      .catch((error) => {
        console.error("Error fetching approved requests:", error);
        setError("Failed to load approved requests. Please try again later.");
      });
  }, []);

  const handleAssign = (requestId) => {
    if (!assignedTo) {
      alert("Please assign to a personnel/department first.");
      return;
    }

    axios
      .put(`/api/ppgshead/requests/${requestId}/in-progress`, { assignedTo })
      .then(() => {
        const updatedRequests = approvedRequests.map((req) =>
          req.id === requestId ? { ...req, status: "In Progress" } : req
        );
        setApprovedRequests(updatedRequests);
        setHistory([
          ...history,
          {
            id: history.length + 1,
            personnel: assignedTo,
            status: "In Progress",
            date: new Date().toLocaleString(),
          },
        ]);
        setStatus("In Progress");
      })
      .catch((error) => {
        console.error("Error assigning request:", error);
        setError("Failed to assign request. Please try again later.");
      });
  };

  const handleComplete = (requestId) => {
    axios
      .put(`/api/ppgshead/requests/${requestId}/completed`)
      .then(() => {
        const updatedRequests = approvedRequests.map((req) =>
          req.id === requestId ? { ...req, status: "Completed" } : req
        );
        setApprovedRequests(updatedRequests);
        setHistory([
          ...history,
          {
            id: history.length + 1,
            personnel: assignedTo,
            status: "Completed",
            date: new Date().toLocaleString(),
          },
        ]);
        setStatus("Completed");
      })
      .catch((error) => {
        console.error("Error completing request:", error);
        setError("Failed to complete request. Please try again later.");
      });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Page Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Head of PPGS</h1>
        <p className="mb-4 text-gray-700">
          Manage approved requests and assign tasks to personnel.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Approved Requests */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-lg font-semibold">Approved Requests</h2>
          {approvedRequests.length === 0 ? (
            <p className="text-gray-500">No approved requests available.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {approvedRequests.map((request) => (
                <li
                  key={request.id}
                  className="border p-2 rounded bg-gray-50"
                >
                  <p><strong>Requester:</strong> {request.requester}</p>
                  <p><strong>Request Type:</strong> {request.type_of_concern}</p>
                  <p><strong>Description:</strong> {request.description}</p>
                  <p><strong>Status:</strong> {request.status}</p>

                  <div className="mt-4">
                    <label className="block mb-2 font-bold">
                      Assign to Personnel:
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">-- Select Personnel --</option>
                      <option value="Aircon Technician">Aircon Technician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Electrician">Electrician</option>
                    </select>

                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => handleAssign(request.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleComplete(request.id)}
                        disabled={request.status !== "In Progress"}
                        className={`px-4 py-2 rounded ${
                          request.status === "In Progress"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Repair History */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Repair History</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No repair history yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((record) => (
                <li
                  key={record.id}
                  className="border p-2 rounded bg-gray-50 flex justify-between"
                >
                  <span>
                    {record.personnel} - {record.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {record.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PPGSHeadPage;
