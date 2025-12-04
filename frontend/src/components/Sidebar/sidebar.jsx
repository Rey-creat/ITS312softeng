// Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaPlusCircle, FaListAlt, FaChartBar } from "react-icons/fa"; // Import icons

export default function Sidebar({ role, profilePicture, fullname }) {
  const navigate = useNavigate();

  // Sidebar menu items for Teachers, Faculty, and Staff
  let menu = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt className="inline mr-3 text-white" /> },
    { name: "Create Request", path: "/createRequest", icon: <FaPlusCircle className="inline mr-3 text-white" /> },
    { name: "My Requests", path: "/myRequest", icon: <FaListAlt className="inline mr-3 text-white" /> },
    { name: "Reports", path: "/reports", icon: <FaChartBar className="inline mr-3 text-white" /> },
  ];
  // Add Noted Requests for DeptHead
  if (role === "DeptHead") {
    menu.push({
      name: "Noted Requests",
      path: "/noted-requests",
      icon: <FaListAlt className="inline mr-3 text-white" />,
    });
    menu.push({
      name: "Done Noted Requests",
      path: "/done-noted-requests",
      icon: <FaListAlt className="inline mr-3 text-white" />,
    });
  }

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
    <div className="h-screen w-65 bg-blue-700 text-white flex flex-col">
      {/* Profile Picture and Name */}
      <div className="p-6 text-center border-b border-blue-700">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="mx-auto h-24 w-24 rounded-full mb-2"
          />
        ) : (
          <div></div>
        )}
        <h1 className="text-xl font-bold">{fullname}</h1> {/* Removed default 'User' fallback */}
        <p className="mt-1 text-gray-300 font-bold">Role: {role}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        {menu.map((item, index) => (
          <div key={index} className="mb-7">
            <Link
              to={item.path}
              className="px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-xl flex items-center"
            >
              {item.icon} {/* Add icon */}
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
