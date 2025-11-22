import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./layout.css";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-layout ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <div className="main-content">
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
