import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const items = [
    { to: "/", label: "Trang chủ" },
    { to: "/accounts", label: "Tài khoản" },
    { to: "/categories", label: "Danh mục" },
    { to: "/brands", label: "Thương hiệu" },
    { to: "/products", label: "Sản phẩm" },
    { to: "/suppliers", label: "Nhà cung cấp" },
    { to: "/receipts", label: "Phiếu nhập" },
    { to: "/warehouse", label: "Kho" },
    { to: "/orders", label: "Đơn hàng" },
    { to: "/reports", label: "Thống kê & báo cáo" },
  ];

  return (
    <aside
      className="bg-white border-end shadow-sm"
      style={{
        width: 240,
        height: "100vh",
        position: "fixed", // 🔒 Ghim cố định bên trái
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <div className="p-4 border-bottom text-center">
        <h5 className="m-0 text-primary">🛠️ Admin Panel</h5>
      </div>
      <nav className="nav flex-column px-2 py-3">
        {items.map((item, i) => (
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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
