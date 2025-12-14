import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaUserTie, 
  FaUserGraduate, 
  FaCrown, 
  FaPlusCircle, 
  FaListAlt, 
  FaChartBar,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaBuilding,
  FaUser,
  FaHome,
  FaFileAlt,
  FaChartPie,
  FaCog,
  FaUniversity
} from "react-icons/fa";

export default function AdminSidebar({ deptHeadHasRequests = false, ppgsHeadHasRequests = false, presidentHasRequests = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  let role = user.role || "User";
  const fullname = user.fullname || "User";
  // Normalize DeptHead-* roles to 'Dept Head' for menu
  let sidebarRole = role;
  if (/^DeptHead-/i.test(role)) {
    sidebarRole = "Dept Head";
  }

  // Define icon mapping for each menu item
  const getIconForMenu = (name) => {
    switch(name) {
      case "Superadmin Dashboard":
        return <FaTachometerAlt className="text-xl" />;
      case "Dashboard":
        return <FaHome className="text-xl" />;
      case "Notifications":
        return <FaBell className="text-xl" />;
      case "Dept. Office Head":
        return <FaBuilding className="text-xl" />;
      case "Head of PPGS":
        return <FaUserGraduate className="text-xl" />;
      case "School President":
        return <FaCrown className="text-xl" />;
      case "Requests":
        return <FaFileAlt className="text-xl" />;
      case "Create Request":
        return <FaPlusCircle className="text-xl" />;
      case "My Requests":
        return <FaListAlt className="text-xl" />;
      case "Reports":
        return <FaChartPie className="text-xl" />;
      case "System Settings":
        return <FaCog className="text-xl" />;
      case "Personnel Dashboard":
        return <FaUser className="text-xl" />;
      default:
        return <FaFileAlt className="text-xl" />;
    }
  };

  // Define menu items for each role
  const roleMenus = {
    Admin: [
      { name: "Superadmin Dashboard", path: "/SuperadminDashboard", exact: true },
      { name: "Notifications", path: "/AdminNotifications" },
      { name: "Dept. Office Head", path: "/DeptHeadPage" },

      { name: "Head of PPGS", path: "/PPGSHeadPage" },
      { name: "School President", path: "/President" },
    ],
    "Dept Head": [
      { name: "Requests ", path: "/DeptHeadPage", exact: true },
    ],
    "PPGS Head": [
      { name: "Dashboard", path: "/AdminDashboard" },
      { name: "Requests", path: "/PPGSHeadPage" },
      { name: "Notifications", path: "/AdminNotifications" },
    ],
    PPGSHead: [
      { name: "Dashboard", path: "/AdminDashboard" },
      { name: "Requests", path: "/PPGSHeadPage" },
      { name: "Notifications", path: "/AdminNotifications" },
    ],
    President: [
      { name: "Requests", path: "/President", exact: true },
    ],
    Personnel: [
      { name: "Requests", path: "/PersonnelDashboard", exact: true },
    ],
    User: [
      // Removed Dashboard, Create Request, My Requests, Reports
    ],
  };

  const menu = roleMenus[sidebarRole] || roleMenus.User;

  // Role-based icon for profile
  const getRoleIcon = () => {
    switch(sidebarRole) {
      case "Admin":
        return <FaUserCircle className="text-2xl text-blue-300" />;
      case "Dept Head":
        return <FaUserTie className="text-2xl text-blue-300" />;
      case "PPGS Head":
        return <FaUserGraduate className="text-2xl text-blue-300" />;
      case "President":
        return <FaCrown className="text-2xl text-blue-300" />;
      case "Personnel":
        return <FaUser className="text-2xl text-blue-300" />;
      default:
        return <FaUserCircle className="text-2xl text-blue-300" />;
    }
  };

  // Check if a menu item is active
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

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

  // Get notification count for specific roles
  const getNotificationCount = (itemName) => {
    if (itemName === "Dept. Office Head" && deptHeadHasRequests) return "!";
    if (itemName === "Head of PPGS" && ppgsHeadHasRequests) return "!";
    if (itemName === "School President" && presidentHasRequests) return "!";
    return null;
  };

  return (
    <div className={`h-screen bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      
      {/* Profile Section */}
      <div className={`p-5 border-b border-blue-700/50 transition-all duration-300 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center'}`}>
          <div className={`bg-blue-600 rounded-full flex items-center justify-center ${collapsed ? 'h-12 w-12' : 'h-14 w-14 mr-4'}`}>
            {getRoleIcon()}
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{sidebarRole === 'Personnel' ? '' : fullname}</h1>
              <div className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                <p className="text-sm text-blue-200 truncate font-medium">{role}{user.department ? ` (${user.department})` : ''}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Title */}
      {!collapsed && (
        <div className="px-5 py-3 border-b border-blue-700/50">
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg mr-3">
              <FaUniversity className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold"> Lccb School Facilities</h2>
              <p className="text-xs text-blue-300">Repair Management System</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item, index) => {
          const active = isActive(item.path, item.exact);
          const notification = getNotificationCount(item.name);
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center rounded-lg p-3 transition-all duration-200 group relative ${
                active 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-blue-700/50 hover:shadow-sm text-blue-100'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : ''}
            >
              <div className={`relative ${collapsed ? '' : 'mr-3'}`}>
                <div className={`transition-transform duration-200 ${active ? 'text-white' : 'group-hover:text-white text-blue-300'}`}>
                  {getIconForMenu(item.name)}
                </div>
                {!collapsed && active && (
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-300 rounded-full animate-ping"></div>
                )}
              </div>
              
              {!collapsed && (
                <>
                  <span className="font-semibold text-base flex-1">{item.name}</span>
                  {active && (
                    <div className="w-1 h-5 bg-blue-300 rounded-full ml-2"></div>
                  )}
                  {notification && (
                    <span className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                      {notification}
                    </span>
                  )}
                </>
              )}
              
              {collapsed && notification && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                  {notification}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      {/* Logout Section */}
      <div className="p-4 border-t border-blue-700/50">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center rounded-lg p-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? "Logout" : ""}
        >
          <FaSignOutAlt className={`${collapsed ? '' : 'mr-3'} text-lg`} />
          {!collapsed && <span className="text-base">Logout</span>}
        </button>
        
        {/* Version Info */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-blue-700/30">
            <p className="text-xs text-blue-300 text-center font-medium">
              v1.0.0 • {new Date().getFullYear()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}