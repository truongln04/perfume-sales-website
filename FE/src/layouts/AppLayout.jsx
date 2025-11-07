import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="d-flex">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Nội dung chính */}
      <main
        className="flex-grow-1"
        style={{
          marginLeft: 240, // khớp với chiều rộng sidebar
          minHeight: "100vh",
          padding: "1rem",
          background: "#f8f9fa",
          overflowX: "auto", // tránh bảng bị tràn
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
