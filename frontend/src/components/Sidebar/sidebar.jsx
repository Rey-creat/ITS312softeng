// Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();

  // Sidebar menu items for Teachers, Faculty, and Staff
  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Create Request", path: "/createRequest" },
    { name: "My Requests", path: "/myRequest" },
    { name: "Reports", path: "/reports" },
  ];

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      // Call backend logout endpoint
      if (token) {
        await fetch("http://localhost:5000/api/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="h-screen w-80 bg-blue-600 text-white flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 text-center border-b border-blue-700">
        <h1 className="text-xl font-bold">School Facilities</h1>
        <p className="text-sm">Repair Management System</p>
        <p className="mt-1 text-gray-300 font-bold">Role: {role}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        {menu.map((item, index) => (
          <div key={index} className="mb-7">
            <Link
              to={item.path}
              className="block px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-xl" // bigger font
            >
              {item.name}
            </Link>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold text-lg" // logout font slightly big too
        >
          Logout
        </button>
      </div>
    </div>
  );
}
