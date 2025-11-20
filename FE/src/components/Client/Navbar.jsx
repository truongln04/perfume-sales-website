import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Load danh mục
    axios
      .get("http://localhost:8081/categories", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));

    // Load thông tin user nếu có token
    if (token) {
      axios
        .get("http://localhost:8081/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => {
          console.error("Token hết hạn hoặc lỗi:", err);
          // Tự động dọn dẹp nếu token không hợp lệ
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        });
    }
  }, []);

  // ĐĂNG XUẤT: Xóa dữ liệu, ở lại trang hiện tại
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);

    // Thông báo cho các component khác (nếu cần cập nhật trạng thái user)
    window.dispatchEvent(new Event("user-logout"));

    // Ở lại trang hiện tại (thường là trang chủ)
    // Nếu bạn muốn chắc chắn về trang chủ, có thể dùng:
    // navigate("/client", { replace: true });
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  return (
    <header className="border-bottom position-relative">
      <div className="container py-3 d-flex align-items-center justify-content-between">
        {/* Logo */}
        <Link to="/client" className="fs-4 fw-bold text-dark text-decoration-none">
          Logo
        </Link>

        {/* Search */}
        <div className="flex-grow-1 mx-5 position-relative">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill ps-5"
            placeholder="Tìm kiếm sản phẩm..."
          />
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
        </div>

        {/* Cart + User */}
        <div className="d-flex gap-4 align-items-center">
          {/* Giỏ hàng */}
          <Link to="/client/cart" className="text-dark position-relative">
            <i className="bi bi-cart3 fs-3"></i>
          </Link>

          {/* Chưa đăng nhập */}
          {!user && (
            <Link
              to="/login"
              className="d-flex align-items-center gap-2 text-dark text-decoration-none fw-medium"
            >
              <i className="bi bi-person-circle fs-3"></i>
              <span className="d-none d-md-block">Đăng nhập</span>
            </Link>
          )}

          {/* Đã đăng nhập */}
          {user && (
            <div
              className="position-relative"
              onClick={(e) => e.stopPropagation()} // ngăn đóng menu khi click vào khu vực
            >
              <img
                src={user.anhDaiDien || user.picture || "/default-avatar.png"}
                alt="Avatar"
                width={45}
                height={45}
                className="rounded-circle shadow-sm"
                style={{ cursor: "pointer", objectFit: "cover", border: "3px solid #fff" }}
                onClick={() => setShowMenu(!showMenu)}
              />

              {/* Dropdown menu */}
              {showMenu && (
                <div
                  className="position-absolute bg-white shadow-lg rounded-3 p-3"
                  style={{
                    top: "60px",
                    right: 0,
                    width: "260px",
                    zIndex: 1000,
                    border: "1px solid #eee",
                  }}
                  onClick={(e) => e.stopPropagation()} // giữ menu mở khi click bên trong
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={user.anhDaiDien || user.picture || "/default-avatar.png"}
                      alt="Avatar"
                      width={50}
                      height={50}
                      className="rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">
                        {user.tenHienThi || user.name || "Người dùng"}
                      </h6>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>

                  <hr className="my-2" />

                  <Link
                    to="/client/profile"
                    className="btn btn-outline-primary w-100 mb-2 rounded-pill"
                    onClick={() => setShowMenu(false)}
                  >
                    <i className="bi bi-person me-2"></i>
                    Thông tin tài khoản
                  </Link>

                  <Link
                    to="/client/orders"
                    className="btn btn-outline-secondary w-100 mb-2 rounded-pill"
                    onClick={() => setShowMenu(false)}
                  >
                    <i className="bi bi-bag me-2"></i>
                    Đơn hàng của tôi
                  </Link>

                  <button className="btn btn-danger w-100 rounded-pill" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu danh mục */}
      <nav className="bg-white shadow-sm">
        <div className="container">
          <ul className="nav justify-content-center py-3 gap-5">
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <li className="nav-item" key={cat.idDanhMuc || cat.id}>
                  <Link
                    className="nav-link text-dark fw-medium fs-5 text-uppercase"
                    to={`/client/category/${cat.idDanhMuc || cat.id}`}
                  >
                    {cat.tenDanhMuc}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}