// Sidebar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaPlusCircle, 
  FaListAlt, 
  FaChartBar, 
  FaCheckCircle,
  FaClipboardCheck,
  FaSignOutAlt,
  FaUserCircle,
  FaCog,
  FaBell
} from "react-icons/fa";

export default function Sidebar({ role, profilePicture, fullname }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
    // Debug: print role value to console
    console.log('Sidebar role prop:', role);

  // Sidebar menu items for Teachers, Faculty, and Staff
  let menu = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt className="text-lg" />, exact: true },
    { name: "Create Request", path: "/createRequest", icon: <FaPlusCircle className="text-lg" /> },
    { name: "My Requests", path: "/myRequest", icon: <FaListAlt className="text-lg" /> },
    { name: "Reports", path: "/reports", icon: <FaChartBar className="text-lg" /> },
  ];

  // For Superadmin, only show Superadmin Dashboard
  if (role === "Superadmin") {
    menu = [
      {
        name: "Dashboard",
        path: "/superadmin",
        icon: <FaUserCircle className="text-lg" />,
        exact: true
      }
    ];
  }

  // Add Noted Requests for DeptHead
  if (role === "DeptHead") {
    menu.push({
      name: "Noted Requests",
      path: "/noted-requests",
      icon: <FaClipboardCheck className="text-lg" />,
    });
    menu.push({
      name: "Completed Requests",
      path: "/done-noted-requests",
      icon: <FaCheckCircle className="text-lg" />,
    });
  }

  // Add admin-specific items
  if (role === "Admin") {
    menu.push({
      name: "System Settings",
      path: "/admin/settings",
      icon: <FaCog className="text-lg" />,
    });
  }

  // Remove notification item for all roles
  menu = menu.filter(item => item.name !== "Notifications");

  // Check if a menu item is active
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:5000/api/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className={`h-screen bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      
      {/* Profile Section */}
      <div className={`p-6 border-b border-blue-700/50 transition-all duration-300 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center'}`}>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className={`rounded-full border-2 border-blue-400 shadow-lg ${collapsed ? 'h-14 w-14' : 'h-16 w-16 mr-4'}`}
            />
          ) : (
            <div className={`bg-blue-600 rounded-full flex items-center justify-center ${collapsed ? 'h-14 w-14' : 'h-16 w-16 mr-4'}`}>
              <FaUserCircle className="text-3xl text-blue-300" />
            </div>
          )}
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{fullname}</h1>
              <div className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                <p className="text-sm text-blue-200 truncate">{role}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2"> {/* Removed overflow-y-auto to prevent sidebar scrolling */}
        {menu.map((item, index) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center rounded-xl p-3 transition-all duration-200 group ${
                active 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]' 
                  : 'hover:bg-blue-700/50 hover:shadow-md text-blue-100'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : ''}
            >
              <div className={`relative ${collapsed ? '' : 'mr-3'}`}>
                <div className={`transition-transform duration-200 ${active ? 'text-white' : 'group-hover:text-white text-blue-300'}`}>
                  {item.icon}
                </div>
                {!collapsed && active && (
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-300 rounded-full animate-ping"></div>
                )}
              </div>
              
              {!collapsed && (
                <>
                  <span className="font-medium flex-1">{item.name}</span>
                  {active && (
                    <div className="w-1 h-4 bg-blue-300 rounded-full ml-2"></div>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-blue-700/50">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center rounded-xl p-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? "Logout" : ""}
        >
          <FaSignOutAlt className={collapsed ? '' : 'mr-3'} />
          {!collapsed && "Logout"}
        </button>
        
        {/* Version Info */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-blue-700/30">
            <p className="text-xs text-blue-300 text-center">
              v1.0.0 • {new Date().getFullYear()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}