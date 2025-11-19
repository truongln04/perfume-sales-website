import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Sidebar() {

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  let role = null;

  // Giải mã token để lấy vai trò
  if (token) {
    try {
      const decoded = jwtDecode(token);

      // Trường hợp Spring Security đưa quyền trong claim "authorities"
      if (decoded.authorities && decoded.authorities.length > 0) {
        // Lấy quyền đầu tiên và bỏ tiền tố ROLE_
        role = decoded.authorities[0].replace("ROLE_", "");
      }

      // Nếu bạn custom JWT để gửi "role" hoặc "vaiTro"
      if (!role) {
        role = decoded.role || decoded.vaiTro || null;
      }

    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }

  console.log("ROLE:", role); // debug

  // Danh sách menu có phân quyền
  const items = [
    { to: "/admin", label: "Trang chủ", roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/accounts", label: "Tài khoản", roles: ["ADMIN"] },
    { to: "/admin/categories", label: "Danh mục", roles: ["ADMIN"] },
    { to: "/admin/brands", label: "Thương hiệu", roles: ["ADMIN"] },

    { to: "/admin/products", label: "Sản phẩm", roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/suppliers", label: "Nhà cung cấp", roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/receipts", label: "Phiếu nhập", roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/warehouse", label: "Kho", roles: ["ADMIN", "NHANVIEN"] },
    { to: "/admin/orders", label: "Đơn hàng", roles: ["ADMIN", "NHANVIEN"] },

    { to: "/admin/reports", label: "Thống kê & báo cáo", roles: ["ADMIN"] },
  ];

  return (
    <aside
      className="bg-white border-end shadow-sm"
      style={{
        width: 240,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <div className="p-4 border-bottom text-center">
        <h5 className="m-0 text-primary">🛠️ Admin Panel</h5>
      </div>

      <nav className="nav flex-column px-2 py-3">
        {items
          .filter(item => item.roles.includes(role)) // Lọc menu theo role lấy từ JWT
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
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}