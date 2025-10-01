import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar"; // adjust path

const PPGSHeadPage = () => {
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("Pending");
  const [history, setHistory] = useState([]);

  const handleAssign = () => {
    if (!assignedTo) {
      alert("Please assign to a personnel/department first.");
      return;
    }

    const newRecord = {
      id: history.length + 1,
      personnel: assignedTo,
      status: "In Progress",
      date: new Date().toLocaleString(),
    };

    setHistory([...history, newRecord]);
    setStatus("In Progress");
  };

  const handleComplete = () => {
    const newRecord = {
      id: history.length + 1,
      personnel: assignedTo,
      status: "Completed",
      date: new Date().toLocaleString(),
    };

    setHistory([...history, newRecord]);
    setStatus("Completed");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Page Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Head of PPGS</h1>
        <p className="mb-4 text-gray-700">
          Assign repair tasks to technicians and track the repair history.
        </p>

        {/* Request Details */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-lg font-semibold">Request Details</h2>
          <p><strong>Requester:</strong> Juan Dela Cruz</p>
          <p><strong>Request Type:</strong> Facility Repair</p>
          <p><strong>Description:</strong> Aircon in Room 201 not working.</p>
          <p><strong>Status:</strong> {status}</p>

          {/* Assign Personnel */}
          <div className="mt-4">
            <label className="block mb-2 font-bold">Assign to Personnel:</label>
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
                onClick={handleAssign}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Assign
              </button>
              <button
                onClick={handleComplete}
                disabled={status !== "In Progress"}
                className={`px-4 py-2 rounded ${
                  status === "In Progress"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                Mark as Completed
              </button>
            </div>
          </div>
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
