import React, { StrictMode } from "react";
import ResetPassword from "./components/Login/ResetPassword.jsx";
import ForgotPassword from "./components/Login/ForgotPassword.jsx";
import DoneNotedRequests from "./components/Admin/DoneNotedRequests.jsx";
import NotedRequests from "./components/Admin/NotedRequests.jsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Public Pages
import Login from "./components/Login/login.jsx";
import Register from "./components/Register/register.jsx";

// User Pages
import Dashboard from "./components/Dashboard/dashboard.jsx";
import CreateRequest from "./components/CreateRequest/createRequest.jsx";
import MyRequest from "./components/MyRequest/myRequest.jsx";
import Reports from "./components/Reports/reports.jsx";

// Admin / Role Pages
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import DeptHeadPage from "./components/Admin/DeptHeadPage.jsx";
import PPGSHeadPage from "./components/Admin/PPGSHeadPage.jsx";
import President from "./components/Admin/President.jsx";
import AdminNotifications from "./components/Admin/AdminNotifications.jsx";
import PersonnelDashboard from "./components/Admin/PersonnelDashboard.jsx";
import SuperadminDashboard from "./components/Admin/SuperadminDashboard.jsx";

// --------------------
// ProtectedRoute: ensures user is logged in
// --------------------
const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");
  return token ? <Component /> : <Navigate to="/login" replace />;
};

// --------------------
// RoleRoute: ensures user has correct role
// Admin can access everything
// --------------------
const RoleRoute = ({ element: Component, allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user?.role) return <Navigate to="/login" replace />;

  // Admin can access all pages
  if (user.role === "Admin") return <Component />;

  // Personnel can ONLY access PersonnelDashboard
  if (user.role === "Personnel") {
    return Component === PersonnelDashboard
      ? <Component />
      : <Navigate to="/PersonnelDashboard" replace />;
  }

  // If user's role is allowed
  if (allowedRoles.includes(user.role)) return <Component />;

  // Otherwise redirect to user dashboard
  return <Navigate to="/dashboard" replace />;
};

// --------------------
// App Render
// --------------------
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User Protected Pages */}
        <Route path="/dashboard" element={<RoleRoute element={Dashboard} allowedRoles={["Teacher", "Staff"]} />} />
        <Route path="/createRequest" element={<RoleRoute element={CreateRequest} allowedRoles={["Teacher", "Staff"]} />} />
        <Route path="/myRequest" element={<RoleRoute element={MyRequest} allowedRoles={["Teacher", "Staff"]} />} />
        <Route path="/reports" element={<RoleRoute element={Reports} allowedRoles={["Teacher", "Staff"]} />} />

        {/* Admin / Role Protected Pages */}
        <Route
          path="/AdminDashboard"
          element={<RoleRoute element={AdminDashboard} allowedRoles={["Admin", "Dept Head", "PPGS Head", "President"]} />}
        />
        <Route
          path="/AdminNotifications"
          element={<RoleRoute element={AdminNotifications} allowedRoles={["Admin", "PPGS Head"]} />}
        />
        <Route
          path="/DeptHeadPage"
          element={<RoleRoute element={DeptHeadPage} allowedRoles={["Dept Head"]} />}
        />
        <Route
          path="/PPGSHeadPage"
          element={<RoleRoute element={PPGSHeadPage} allowedRoles={["PPGS Head"]} />}
        />
        <Route
          path="/President"
          element={<RoleRoute element={President} allowedRoles={["President"]} />}
        />
        <Route
          path="/PersonnelDashboard"
          element={<RoleRoute element={PersonnelDashboard} allowedRoles={["Personnel"]} />}
        />
        <Route path="/superadmin" element={<RoleRoute element={SuperadminDashboard} allowedRoles={["Superadmin"]} />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </StrictMode>
);
