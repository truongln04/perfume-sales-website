import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const containerRef = useRef();
  const navigate = useNavigate();
  const visibleCount = 5; // Số danh mục hiển thị trên navbar

  const [scrollIndex, setScrollIndex] = useState(0); // chỉ số danh mục đầu tiên hiển thị

  // ------------------- Load dữ liệu -------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8081/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));

    if (token) {
      axios
        .get("http://localhost:8081/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        });
    }

    const handleLogoutEvent = () => setUser(null);
    window.addEventListener("user-logout", handleLogoutEvent);
    return () => window.removeEventListener("user-logout", handleLogoutEvent);
  }, []);

  // ------------------- Search API -------------------
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      axios
        .get(`http://localhost:8081/products/search?keyword=${searchQuery}&size=5`)
        .then((res) => setSearchResults(res.data.content || res.data || []))
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // ------------------- Logout -------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    window.dispatchEvent(new Event("user-logout"));
  };

  // ------------------- Close user menu -------------------
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    setTimeout(() => document.addEventListener("click", close), 100);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  // ------------------- Scroll danh mục -------------------
  const scrollLeft = () => {
    setScrollIndex((prev) => Math.max(prev - visibleCount, 0));
  };

  const scrollRight = () => {
    setScrollIndex((prev) =>
      Math.min(prev + visibleCount, Math.max(categories.length - visibleCount, 0))
    );
  };

  const visibleCategories = categories.slice(
    scrollIndex,
    scrollIndex + visibleCount
  );
  // ------------------- Cập nhật giỏ hàng -------------------
// ------------------- Cập nhật giỏ hàng -------------------
const [cartCount, setCartCount] = useState(0);
const token = localStorage.getItem("token");
useEffect(() => {
  

  // Hàm load số lượng tổng sản phẩm trong giỏ
  const loadCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      // Lấy userId
      const meRes = await axios.get("http://localhost:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = meRes.data.idTaiKhoan;

      // Lấy giỏ hàng
      const cartRes = await axios.get(`http://localhost:8081/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cart = cartRes.data;

      // Nếu người dùng chưa có giỏ hàng
      if (!cart || !cart.chiTietGioHang) {
        setCartCount(0);
        return;
      }

      // Tính tổng số lượng
      const totalProducts = cart.chiTietGioHang.length;

      setCartCount(totalProducts);
    } catch (err) {
      console.warn("Lỗi load giỏ hàng:", err);
      setCartCount(0);
    }
  };

  // Load khi token sẵn
  if (token) {
    loadCartCount();
  }

  // Lắng nghe sự kiện cập nhật từ ProductDetail hoặc Cart
  const handleCartUpdate = (e) => {
    if (e.detail === "refresh") {
      loadCartCount(); // Reload lại từ backend
    } else if (typeof e.detail === "number") {
      setCartCount(e.detail); // Trường hợp bạn truyền số trực tiếp
    }
  };

  window.addEventListener("cart-updated", handleCartUpdate);

  return () => {
    window.removeEventListener("cart-updated", handleCartUpdate);
  };
}, [token]); // Chỉ chạy 1 lần khi mount

  // ------------------- Render -------------------
  return (
    // Thay đổi phần header
<header className="border-bottom bg-white sticky-top" style={{ zIndex: 1100 }}>
  {/* Top bar */}
  <div className="container py-3 d-flex align-items-center justify-content-between">
    {/* Logo */}
    <Link to="/client" className="text-decoration-none">
      <img
        src="https://orchard.vn/wp-content/uploads/2024/04/logo-orchard-2024-small.png"
        alt="Logo Orchard"
        style={{ height: "50px", objectFit: "contain" }}
      />
    </Link>

    {/* Search → ghim riêng */}
    <div
      className="flex-grow-1 mx-4 mx-md-5 position-relative"
      ref={containerRef}
    >
      <input
        type="text"
        className="form-control form-control-lg rounded-pill ps-5"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSearchDropdown(true)}
        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
        onKeyDown={(e) =>
          e.key === "Enter" && navigate("/client/products?q=" + searchQuery)
        }
      />
      <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>

      {showSearchDropdown && searchResults.length > 0 && (
        <div
          className="position-absolute w-100 bg-white shadow rounded-3 mt-1"
          style={{ zIndex: 1300 }}
        >
          {searchResults.map((product) => (
            <Link
              key={product.idSanPham}
              to={`/client/product/${product.idSanPham}`}
              className="d-block px-3 py-2 text-decoration-none text-dark"
              onClick={() => setShowSearchDropdown(false)}
            >
              {product.tenSanPham}
            </Link>
          ))}
        </div>
      )}
    </div>

        {/* Cart + User */}
        <div className="d-flex align-items-center gap-4">
          <Link to="/client/cart" className="text-dark position-relative">
            <i className="bi bi-cart3 fs-3"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>


          {!user ? (
            <Link
              to="/login"
              className="d-flex align-items-center gap-2 text-dark text-decoration-none"
            >
              <i className="bi bi-person-circle fs-3"></i>
              <span className="d-none d-md-inline fw-medium">Đăng nhập</span>
            </Link>
          ) : (
            <div className="position-relative">
              <img
                src={user.anhDaiDien || user.picture || "/default-avatar.png"}
                alt="Avatar"
                width={45}
                height={45}
                className="rounded-circle object-fit-cover border border-3 border-white shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => setShowMenu(!showMenu)}
              />

             {showMenu && (
  <div
    className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-4 p-4"
    style={{
      width: "320px", // tăng chiều rộng
      zIndex: 1050,
      border: "1px solid #eee",
      minWidth: "300px", // đảm bảo không bị nhỏ
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="d-flex align-items-center gap-3 mb-3">
      <img
        src={user.anhDaiDien || user.picture || "/default-avatar.png"}
        alt=""
        width={60}
        height={60}
        className="rounded-circle"
      />
      <div>
        <h6 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>
          {user.tenHienThi || user.name}
        </h6>
        <small className="text-muted" style={{ fontSize: "0.875rem" }}>
          {user.email}
        </small>
      </div>
    </div>
    <hr />
    <Link
      to="/client/profile"
      className="btn btn-outline-primary w-100 mb-2 rounded-pill"
      style={{ fontSize: "0.95rem", padding: "8px 12px" }}
      onClick={() => setShowMenu(false)}
    >
      <i className="bi bi-person me-2"></i> Thông tin cá nhân
    </Link>
    <Link
      to="/client/orderslist"
      className="btn btn-outline-secondary w-100 mb-3 rounded-pill"
      style={{ fontSize: "0.95rem", padding: "8px 12px" }}
      onClick={() => setShowMenu(false)}
    >
      <i className="bi bi-bag-check me-2"></i> Đơn hàng của tôi
    </Link>
    <button
      className="btn btn-danger w-100 rounded-pill"
      style={{ fontSize: "0.95rem", padding: "8px 12px" }}
      onClick={handleLogout}
    >
      <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
    </button>
  </div>
)}

            </div>
          )}
        </div>
      </div>

      {/* Menu danh mục hiển thị 5 + scroll */}
      <nav className="bg-light border-top border-bottom py-2 position-relative">
        <div className="container d-flex align-items-center position-relative justify-content-center">
          {scrollIndex > 0 && (
            <button
    className="btn position-absolute start-0"
    style={{
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      fontSize: "1.5rem",
      color: "#333",
      padding: 0,
    }}
    onClick={scrollLeft}
  >
    &#60;
  </button>
          )}

          <ul className="nav flex-nowrap">
            <div className="d-flex gap-3">
              {visibleCategories.map((cat) => (
                <li key={cat.idDanhMuc || cat.id} className="nav-item">
                  <Link
                    className="nav-link text-dark fw-semibold text-uppercase px-3"
                    to={`/client/category/${cat.idDanhMuc || cat.id}`}
                  >
                    {cat.tenDanhMuc}
                  </Link>
                </li>
              ))}
            </div>
          </ul>

          {scrollIndex + visibleCount < categories.length && (
            <button
    className="btn position-absolute end-0"
    style={{
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      fontSize: "1.5rem",
      color: "#333",
      padding: 0,
    }}
    onClick={scrollRight}
  >
    &#62;
  </button>
          )}
        </div>
      </nav>
    </header>
  );
}
