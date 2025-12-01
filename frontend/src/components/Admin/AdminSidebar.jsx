// AdminSidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUserTie, FaUserGraduate, FaCrown, FaPlusCircle, FaListAlt, FaChartBar } from "react-icons/fa"; // Import icons

export default function AdminSidebar({ deptHeadHasRequests = false, ppgsHeadHasRequests = false, presidentHasRequests = false }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "User";

  // Define menu items for each role
  const roleMenus = {
    Admin: [
      { name: "Dashboard", path: "/AdminDashboard", icon: <FaTachometerAlt className="inline mr-3 text-white" /> },
      { name: "Dept. Office Head", path: "/DeptHeadPage", icon: <FaUserTie className="inline mr-3 text-white" /> },
      { name: "Head of PPGS", path: "/PPGSHeadPage", icon: <FaUserGraduate className="inline mr-3 text-white" /> },
      { name: "School President", path: "/President", icon: <FaCrown className="inline mr-3 text-white" /> },
    ],
    DeptHead: [
      { name: "Requests", path: "/DeptHeadPage", icon: <FaListAlt className="inline mr-3 text-white" /> },
    ],
    PPGSHead: [
      { name: "Dashboard", path: "/PPGSHeadPage", icon: <FaTachometerAlt className="inline mr-3 text-white" /> },
    ],
    President: [
      { name: "Dashboard", path: "/President", icon: <FaTachometerAlt className="inline mr-3 text-white" /> },
    ],
    User: [
      { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt className="inline mr-3 text-white" /> },
      { name: "Create Request", path: "/createRequest", icon: <FaPlusCircle className="inline mr-3 text-white" /> },
      { name: "My Requests", path: "/myRequest", icon: <FaListAlt className="inline mr-3 text-white" /> },
      { name: "Reports", path: "/reports", icon: <FaChartBar className="inline mr-3 text-white" /> },
    ],
  };

  const menu = roleMenus[role] || roleMenus.User;

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
      {/* Logo / Title */}
      <div className="p-6 text-center border-b border-blue-700">
        <h1 className="text-xl font-bold">School Facilities</h1>
        <p className="text-sm">Repair Management System</p>
        <p className="mt-1 text-gray-300 font-bold">Role: {role}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        {menu.map((item, index) => (
          <div key={index} className="mb-7 flex items-center"> {/* Adjusted gap to match Sidebar */}
            <Link
              to={item.path}
              className="block px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-xl flex items-center" /* Adjusted text size to match Sidebar */
            >
              {item.icon} {/* Icons already match Sidebar */}
              {item.name}
            </Link>
            {item.name === "Dept. Office Head" && deptHeadHasRequests && (
              <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Requests need to be noted"></span>
            )}
            {item.name === "Head of PPGS" && ppgsHeadHasRequests && (
              <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Requests need PPGS Head approval"></span>
            )}
            {item.name === "School President" && presidentHasRequests && (
              <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Requests need President approval"></span>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
