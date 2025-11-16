// Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "User";

  // Define menu items for each role
  const roleMenus = {
    Admin: [
      { name: "Dashboard", path: "/AdminDashboard" },
      { name: "Dept. Office Head", path: "/DeptHeadPage" },
      { name: "VPFGS", path: "/VPFGSPage" },
      { name: "Personnel in Charge", path: "/PersonnelPage" },
      { name: "Head of PPGS", path: "/PPGSHeadPage" },
      { name: "VPAA", path: "/VPAA" },
      { name: "School President", path: "/President" },
    ],
    DeptHead: [{ name: "Dashboard", path: "/DeptHeadPage" }],
    VPFGS: [{ name: "Dashboard", path: "/VPFGSPage" }],
    Personnel: [{ name: "Dashboard", path: "/PersonnelPage" }],
    PPGSHead: [{ name: "Dashboard", path: "/PPGSHeadPage" }],
    VPAA: [{ name: "Dashboard", path: "/VPAA" }],
    President: [{ name: "Dashboard", path: "/President" }],
    User: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Create Request", path: "/createRequest" },
      { name: "My Requests", path: "/myRequest" },
      { name: "Reports", path: "/reports" },
    ],
  };

  const menu = roleMenus[role] || roleMenus.User;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
          <div key={index} className="mb-4">
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
