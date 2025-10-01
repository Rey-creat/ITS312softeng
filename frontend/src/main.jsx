import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./components/Login/login.jsx";
import Register from "./components/Register/register.jsx";
import Sidebar from "./components/Sidebar/sidebar.jsx";
import Dashboard from "./components/Dashboard/dashboard.jsx";
import CreateRequest from "./components/CreateRequest/createRequest.jsx";
import MyRequest from "./components/MyRequest/myRequest.jsx";
import Reports from "./components/Reports/reports.jsx";
import AdminSidebar from "./components/Admin/AdminSidebar.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import DeptHeadPage from "./components/Admin/DeptHeadPage.jsx";
import VPFGSPage from "./components/Admin/VPFGSPage.jsx";
import PersonnelPage from "./components/Admin/PersonnelPage.jsx";
 import PPGSHeadPage from "./components/Admin/PPGSHeadPage.jsx";
import VPAA from "./components/Admin/VPAA.jsx";
import President from "./components/Admin/President.jsx"; 




const root = createRoot(document.getElementById("root"));


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Default route goes to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createRequest" element={<CreateRequest />} />
        <Route path="/myRequest" element={<MyRequest />} />
        <Route path="/reports" element={<Reports />} />
         {/* Admin Routes */}
      <Route path="/AdminSidebar" element={<AdminSidebar />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/DeptHeadPage" element={<DeptHeadPage />} />
      <Route path="/VPFGSPage" element={<VPFGSPage />} />
      <Route path="/PersonnelPage" element={<PersonnelPage />} />
      <Route path="/PPGSHeadPage" element={<PPGSHeadPage />} />
       <Route path="/VPAA" element={<VPAA />} />
      <Route path="/President" element={<President />} />
      </Routes>
    </Router>
  </StrictMode>
);
