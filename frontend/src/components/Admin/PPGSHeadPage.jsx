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
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: "Approved" } : req))
      );
      alert("Request approved successfully"); // Success message
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/ppgshead/requests/${id}/reject`);
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: "Rejected" } : req))
      );
      alert("Request rejected successfully"); // Success message
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
        <h1 className="text-2xl font-bold text-gray-800">PPGS Head</h1>

        {notedRequests.length === 0 ? (
          <p>No noted requests available for approval</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"> {/* Adjusted gap and margin for better spacing */}
            {notedRequests.map(req => (
              <div key={req.id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"> {/* Enhanced shadow and border */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">Request #{req.id}</h2> {/* Adjusted text size and color */}
                <p className="text-sm text-gray-900 mb-2"><strong>Date Filed:</strong> {formatDate(req.date_filed)}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Date Needed:</strong> {formatDate(req.date_needed)}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Type:</strong> {req.type_of_concern}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Description:</strong> {req.description}</p>
                <p className="text-sm text-gray-900 mb-2"><strong>Requested By:</strong> {req.requested_by}</p>
                <p className="text-sm text-gray-900 mb-4"><strong>Noted By:</strong> {req.noted_by}</p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition"
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
