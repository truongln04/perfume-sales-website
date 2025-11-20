import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null); // Danh mục đang hover
  const [productsInCategory, setProductsInCategory] = useState([]); // Sản phẩm của danh mục đang hover
  const [loadingProducts, setLoadingProducts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Load danh mục
    axios
      .get("http://localhost:8081/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));

    // Load thông tin user
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

    // Lắng nghe đăng xuất từ nơi khác
    const handleLogoutEvent = () => setUser(null);
    window.addEventListener("user-logout", handleLogoutEvent);
    return () => window.removeEventListener("user-logout", handleLogoutEvent);
  }, []);

  // Khi hover vào danh mục → gọi API lấy sản phẩm (tối đa 8-10 cái nổi bật)
  const handleCategoryHover = (categoryId) => {
    if (hoveredCategory === categoryId) return;

    setHoveredCategory(categoryId);
    setLoadingProducts(true);

    axios
      .get(`http://localhost:8081/categories/${categoryId}/products?size=5`)
      .then((res) => {
        setProductsInCategory(res.data.content || res.data || []);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error("Lỗi load sản phẩm danh mục:", err);
        setProductsInCategory([]);
        setLoadingProducts(false);
      });
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
    setProductsInCategory([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    window.dispatchEvent(new Event("user-logout"));
  };

  // Đóng menu user khi click ngoài
  useEffect(() => {
  if (!showMenu) return;

  const close = () => setShowMenu(false);

  // Fix lỗi không click được dropdown
  setTimeout(() => {
    document.addEventListener("click", close);
  }, 100);

  return () => document.removeEventListener("click", close);
}, [showMenu]);

  return (
    <header className="border-bottom bg-white">
      {/* Top bar */}
      <div className="container py-3 d-flex align-items-center justify-content-between">
        <Link to="/client" className="fs-3 fw-bold text-primary text-decoration-none">
          MyShop
        </Link>

        <div className="flex-grow-1 mx-4 mx-md-5 position-relative">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill ps-5"
            placeholder="Tìm kiếm sản phẩm..."
            onKeyDown={(e) => e.key === "Enter" && navigate("/client/products?q=" + e.target.value)}
          />
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
        </div>

        <div className="d-flex align-items-center gap-4">
          <Link to="/client/cart" className="text-dark position-relative">
            <i className="bi bi-cart3 fs-3"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </Link>

          {/* User */}
          {!user ? (
            <Link to="/login" className="d-flex align-items-center gap-2 text-dark text-decoration-none">
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

              {/* Dropdown User */}
              {showMenu && (
                <div
                  className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-4 p-4"
                  style={{ width: "280px", zIndex: 1050, border: "1px solid #eee" }}
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
                      <h6 className="mb-0 fw-bold">{user.tenHienThi || user.name}</h6>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                  <hr />
                  <Link to="/client/profile" className="btn btn-outline-primary w-100 mb-2 rounded-pill" onClick={() => setShowMenu(false)}>
                  <i className="bi bi-person me-2"></i>
                    Thông tin cá nhân
                  </Link>
                  <Link to="/client/orders" className="btn btn-outline-secondary w-100 mb-3 rounded-pill" onClick={() => setShowMenu(false)}>
                  <i className="bi bi-bag-check me-2"></i>
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

      {/* Menu danh mục - Có dropdown sản phẩm khi hover */}
      <nav className="bg-light border-top border-bottom">
        <div className="container position-relative">
          <ul className="nav justify-content-center py-3 gap-5">
            {categories.map((cat) => (
              <li
                key={cat.idDanhMuc || cat.id}
                className="nav-item position-relative"
                onMouseEnter={() => handleCategoryHover(cat.idDanhMuc || cat.id)}
                onMouseLeave={handleCategoryLeave}
              >
                <Link
                  className="nav-link text-dark fw-semibold text-uppercase px-3"
                  to={`/client/category/${cat.idDanhMuc || cat.id}`}
                >
                  {cat.tenDanhMuc}
                </Link>

                {/* Dropdown sản phẩm khi hover */}
                {hoveredCategory === (cat.idDanhMuc || cat.id) && productsInCategory.length > 0 && (
                  <div
                    className="position-absolute start-50 translate-x-n50 bg-white shadow-lg rounded-4 p-4"
                    style={{
                      top: "100%",
                      width: "900px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 1000,
                      border: "1px solid #eee",
                    }}
                    onMouseEnter={() => handleCategoryHover(cat.idDanhMuc || cat.id)} // giữ mở khi di vào dropdown
                    onMouseLeave={handleCategoryLeave}
                  >
                    {loadingProducts ? (
                      <p className="text-center text-muted py-5">Đang tải sản phẩm...</p>
                    ) : (
                      <div className="row g-3">
                        {productsInCategory.slice(0, 8).map((product) => (
                          <div key={product.idSanPham} className="col-3">
                            <Link
                              to={`/client/product/${product.idSanPham}`}
                              className="text-decoration-none text-dark"
                              onClick={() => setHoveredCategory(null)}
                            >
                              <div className="text-center">
                                <img
                                  src={product.anhSanPham || product.anhChinh || "/placeholder.jpg"}
                                  alt={product.tenSanPham}
                                  className="img-fluid rounded-3 mb-2"
                                  style={{ height: "120px", objectFit: "cover" }}
                                />
                                <h6 className="small fw-medium mb-1 line-clamp-2">
                                  {product.tenSanPham}
                                </h6>
                                <p className="text-danger fw-bold mb-0">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(product.giaBan || product.gia)}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                        {productsInCategory.length > 8 && (
                          <div className="col-12 text-center mt-3">
                            <Link
                              to={`/client/category/${cat.idDanhMuc || cat.id}`}
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setHoveredCategory(null)}
                            >
                              Xem tất cả {productsInCategory.length} sản phẩm
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}