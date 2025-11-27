import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaHome,
  FaUsers,
  FaBox,
  FaChartBar,
  FaTags,
  FaIndustry,
  FaTruck,
  FaClipboardList,
  FaWarehouse,
  FaShoppingCart,
} from "react-icons/fa";

export default function Sidebar({ collapsed, setCollapsed }) {
  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  let role = null;

  // Giải mã token để lấy vai trò
  if (token) {
    try {
      const decoded = jwtDecode(token);

      if (decoded.email && !decoded.authorities) {
        role = "KHACHHANG";
      }
      if (!role && decoded.authorities?.length > 0) {
        role = decoded.authorities[0].replace("ROLE_", "");
      }
      if (!role) {
        role = decoded.role || decoded.vaiTro || null;
      }
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }

  // Danh sách menu có phân quyền
  const items = [
    { to: "/admin", label: "Trang chủ", icon: <FaHome />, roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/accounts", label: "Quản lý tài khoản", icon: <FaUsers />, roles: ["ADMIN"] },
    { to: "/admin/categories", label: "Quản lý danh mục", icon: <FaTags />, roles: ["ADMIN"] },
    { to: "/admin/brands", label: "Quản lý thương hiệu", icon: <FaIndustry />, roles: ["ADMIN"] },

    { to: "/admin/products", label: "Quản lý sản phẩm", icon: <FaBox />, roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/suppliers", label: "Quản lý nhà cung cấp", icon: <FaTruck />, roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/receipts", label: "Quản lý phiếu nhập", icon: <FaClipboardList />, roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/warehouse", label: "Quản lý tồn kho", icon: <FaWarehouse />, roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/orders", label: "Quản lý đơn hàng", icon: <FaShoppingCart />, roles: ["ADMIN", "NHANVIEN"] },

    { to: "/admin/reports", label: "Thống kê & báo cáo", icon: <FaChartBar />, roles: ["ADMIN"] },
  ];

  return (
    <aside
      className="bg-white border-end shadow-sm d-flex flex-column"
      style={{
        width: collapsed ? 70 : 240,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        transition: "width 0.3s ease",
      }}
    >
      {/* Header */}
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        {!collapsed && (
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK8xqCPSR7KkY47VGIAOC06zwfZ1w5VCb7kg&s" alt="Logo" style={{ height: 32 }} />
        )}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Menu */}
      <nav className="nav flex-column px-2 py-3 flex-grow-1">
        {items
          .filter(item => item.roles.includes(role))
          .map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) =>
                "nav-link d-flex align-items-center gap-2 px-3 py-2 rounded mb-1 fw-medium " +
                (isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-dark hover-bg-light")
              }
              end
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-top text-center">
        {!collapsed && <small className="text-muted">© 2025 MyCompany</small>}
      </div>
    </aside>
  );
}
