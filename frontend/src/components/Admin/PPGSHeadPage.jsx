import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const PPGSHeadPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/ppgshead/approved-requests");
        let allRequests = res.data.sort((a, b) => a.id - b.id);

        // Load all noted requests stored from Dept Head
        const storedRequests = JSON.parse(localStorage.getItem("notedRequests")) || [];

        storedRequests.forEach(stored => {
          if (!allRequests.find(r => r.id === stored.id)) {
            allRequests.push(stored);
          }
        });

        setRequests(allRequests.sort((a, b) => a.id - b.id));
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/ppgshead/requests/${id}/approve`);
      setRequests(prev => prev.filter(req => req.id !== id));

      let stored = JSON.parse(localStorage.getItem("notedRequests")) || [];
      stored = stored.filter(r => r.id !== id);
      localStorage.setItem("notedRequests", JSON.stringify(stored));
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/ppgshead/requests/${id}/reject`);
      setRequests(prev => prev.filter(req => req.id !== id));

      let stored = JSON.parse(localStorage.getItem("notedRequests")) || [];
      stored = stored.filter(r => r.id !== id);
      localStorage.setItem("notedRequests", JSON.stringify(stored));
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const notedRequests = requests.filter(req => req.noted_by);

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">PPGS Head</h1>

        {notedRequests.length === 0 ? (
          <p>No noted requests available for approval</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notedRequests.map(req => (
              <div key={req.id} className="bg-white shadow rounded p-4">
                <h2 className="font-bold text-lg mb-2">Request #{req.id}</h2>
                <p><strong>Date Filed:</strong> {formatDate(req.date_filed)}</p>
                <p><strong>Date Needed:</strong> {formatDate(req.date_needed)}</p>
                <p><strong>Type:</strong> {req.type_of_concern}</p>
                <p><strong>Description:</strong> {req.description}</p>
                <p><strong>Requested By:</strong> {req.requested_by}</p>
                <p><strong>Noted By:</strong> {req.noted_by}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PPGSHeadPage;
