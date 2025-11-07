import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div>
      <Sidebar />
      <Header />
      <div
        className="main-content"
        style={{
          marginLeft: 240,
          paddingTop: 70, // tránh bị header đè
          background: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
