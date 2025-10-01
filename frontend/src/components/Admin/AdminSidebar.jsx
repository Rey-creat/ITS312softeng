// AdminSidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminSidebar({ role }) {
  const navigate = useNavigate();

  // Admin menu items
  const menu = [
    { name: "Dashboard", path: "/AdminDashboard" },
    { name: "Dept. Office Head", path: "/DeptHeadPage" },
    { name: "VPFGS", path: "/VPFGSPage" },
    { name: "Personnel in Charge", path: "/PersonnelPage" },
    { name: "Head of PPGS", path: "/PPGSHeadPage" },
    { name: "VPAA", path: "/VPAA" },
    { name: "School President", path: "/President" },
  ];

  // Logout handler
  const handleLogout = () => {
    // Clear session or token if needed
    // localStorage.removeItem("adminToken");

    navigate("/login"); // Redirect to login
  };

  return (
    <div className="h-screen w-80 bg-blue-600 text-white flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 text-center border-b border-blue-700">
        <h1 className="text-xl font-bold">School Facilities</h1>
        <p className="text-sm">Repair Management System</p>
        <p className="mt-1 text-gray-300 font-bold">Role: {role || "Admin"}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        {menu.map((item, index) => (
          <div key={index} className="mb-7">
            <Link
              to={item.path}
              className="block px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-lg"
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
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
