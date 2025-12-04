import React, { useEffect, useState } from "react";

export default function DoneNotedRequests() {
  const [doneNotedRequests, setDoneNotedRequests] = useState([]);

  useEffect(() => {
    // Load done noted requests from localStorage and sort from new to old by reference code/id
    const stored = JSON.parse(localStorage.getItem("doneNotedRequests")) || [];
    // Sort ascending by id (oldest to newest)
    const sorted = stored.sort((a, b) => a.id - b.id);
    setDoneNotedRequests(sorted);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Done Noted Requests</h1>
      {doneNotedRequests.length === 0 ? (
        <div className="text-gray-600">No done noted requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doneNotedRequests.map((req) => (
            <div key={req.id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div>
                  <span className="text-sm font-semibold text-gray-500">Date Filed:</span>
                  <span className="ml-2 text-gray-900">{req.date_filed}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500">Date Needed:</span>
                  <span className="ml-2 text-gray-900">{req.date_needed}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500">Type:</span>
                  <span className="ml-2 text-gray-900">{req.type_of_concern}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500">Description:</span>
                  <span className="ml-2 text-gray-700">{req.description}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500">Requested By:</span>
                  <span className="ml-2 text-gray-900">{req.requested_by}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500">Noted By:</span>
                  <span className="ml-2 text-green-700 font-semibold">{req.noted_by}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
