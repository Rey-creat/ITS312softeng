import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminNotifications() {
    const [requests, setRequests] = useState([]);
    // Static personnel options
    const personnel = [
        { id: 1, fullname: "Personnel 1" },
        { id: 2, fullname: "Personnel 2" },
        { id: 3, fullname: "Personnel 3" },
    ];
    const [assigning, setAssigning] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalRequestId, setModalRequestId] = useState(null);
    const [personnelName, setPersonnelName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Fetch requests that are approved by PPGS Head and President
        const fetchRequests = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/requests?role=Admin", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Only show requests approved by President (status only)
                const filtered = res.data.filter(
                    r => r.status === "Approved"
                );
                setRequests(filtered);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                } else {
                    setError("Error fetching requests.");
                }
            }
        };
        fetchRequests();
    }, []);

    const openAssignModal = (requestId) => {
        setModalRequestId(requestId);
        setPersonnelName("");
        setShowModal(true);
    };

    const handleAssignModal = async () => {
        if (!personnelName.trim()) {
            setError("Please enter personnel name.");
            return;
        }
        setAssigning((prev) => ({ ...prev, [modalRequestId]: true }));
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:5000/api/requests/${modalRequestId}/assign`,
                { personnelName: personnelName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === modalRequestId
                        ? { ...r, assigned_to: personnelName.trim(), assigned_personnel_name: personnelName.trim() }
                        : r
                )
            );
            setSuccess("Personnel assigned successfully.");
            setTimeout(() => setSuccess("") , 2000);
            setShowModal(false);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error assigning personnel.";
            console.error("Assignment error:", err.response?.data);
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError(errorMsg);
            }
        }
        setAssigning((prev) => ({ ...prev, [modalRequestId]: false }));
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Important Notifications</h1>
                <p className="mb-6 text-gray-700">Assign personnel to approved requests below.</p>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                        {error.includes("log in") && (
                            <button
                                className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                                onClick={() => navigate("/login")}
                            >
                                Go to Login
                            </button>
                        )}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                        {success}
                    </div>
                )}
                {!error && requests.length > 0 ? (
                    <table className="w-full text-sm mb-8">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-left">ID</th>
                                <th className="px-3 py-2 text-left">Requester</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Description</th>
                                <th className="px-3 py-2 text-left">Noted By</th>
                                <th className="px-3 py-2 text-left">Assign Personnel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-3 py-2">{req.id}</td>
                                    <td className="px-3 py-2">{req.requested_by}</td>
                                    <td className="px-3 py-2">{req.type_of_concern}</td>
                                    <td className="px-3 py-2">{req.description}</td>
                                    <td className="px-3 py-2">{req.noted_by || "—"}</td>
                                    <td className="px-3 py-2">
                                        <button
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            onClick={() => openAssignModal(req.id)}
                                            disabled={assigning[req.id]}
                                        >
                                            Assign
                                        </button>
                                    </td>
                                            {showModal && (
                                                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                                                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                                                        <h2 className="text-lg font-bold mb-4">Assign Personnel</h2>
                                                        <input
                                                            type="text"
                                                            value={personnelName}
                                                            onChange={e => setPersonnelName(e.target.value)}
                                                            className="border rounded px-3 py-2 w-full mb-4"
                                                            placeholder="Enter personnel name"
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                                                onClick={() => setShowModal(false)}
                                                                type="button"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                                onClick={handleAssignModal}
                                                                disabled={assigning[modalRequestId]}
                                                                type="button"
                                                            >
                                                                Assign
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (!error && <p className="text-gray-600">No important notifications or requests to assign.</p>)}
            </div>
        </div>
    );
}