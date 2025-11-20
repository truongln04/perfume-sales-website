import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Lỗi lấy thông tin user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("account-updated")); // thông báo Navbar cập nhật
      navigate("/login");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className="container py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-person-circle text-muted" style={{ fontSize: "5rem" }}></i>
          <h3 className="mt-4 text-muted">Bạn chưa đăng nhập</h3>
          <p className="text-muted mb-4">Đăng nhập để xem thông tin cá nhân và lịch sử đơn hàng</p>
          <a href="/login" className="btn btn-primary btn-lg px-5">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="row g-5">
        {/* Avatar + Info nhanh */}
        <div className="col-lg-4">
          <div className="text-center">
            <div className="position-relative d-inline-block">
              <img
                src={user.anhDaiDien || "/default-avatar.png"}
                alt="Avatar"
                className="rounded-circle shadow-lg"
                width={180}
                height={180}
                style={{ objectFit: "cover", border: "6px solid white" }}
              />
              <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: "50px", height: "50px", transform: "translate(20%, 20%)" }}>
                <i className="bi bi-person-fill fs-4"></i>
              </div>
            </div>

            <h4 className="mt-4 fw-bold">{user.tenHienThi || "Khách hàng"}</h4>
            <p className="text-muted">
              <i className="bi bi-envelope me-2"></i>
              {user.email}
            </p>

            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-outline-primary rounded-pill py-2">
                <i className="bi bi-pencil-square me-2"></i>
                Chỉnh sửa hồ sơ
              </button>
              <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill py-2">
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="col-lg-8">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5" style={{ border: "1px solid #f0f0f0" }}>
            <h3 className="fw-bold mb-4">
              <i className="bi bi-person-lines-fill text-primary me-3"></i>
              Thông tin cá nhân
            </h3>

            <div className="row g-4">
              <div className="col-12">
                <label className="form-label fw-semibold text-muted">Họ và tên</label>
                <div className="p-3 bg-light rounded-3 border">
                  <span className="fs-5">{user.tenHienThi || "Chưa cập nhật"}</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted">Số điện thoại</label>
                <div className="p-3 bg-light rounded-3 border">
                  <span className="fs-5">{user.sdt || "Chưa cập nhật"}</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted">Email</label>
                <div className="p-3 bg-light rounded-3 border">
                  <span className="fs-5">{user.email}</span>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-muted">Mật khẩu</label>
                <div className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                  <span className="fs-5">
                    {!user.matKhau || user.matKhau.trim() === ""
        ? "Chưa đặt mật khẩu"
        : showPassword
        ? "Mật khẩu đã được mã hóa"
        : "••••••••••••"}
                  </span>
                  {user.matKhau && user.matKhau.trim() !== "" && (
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none text-muted p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} fs-5`}></i>
                  </button>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-5" />

            {/* Các chức năng khác */}
            <h5 className="fw-bold mb-4">
              <i className="bi bi-grid-3x3-gap-fill text-primary me-2"></i>
              Quản lý tài khoản
            </h5>

            <div className="row g-3">
              <div className="col-sm-6">
                <a href="/orders" className="btn btn-outline-dark w-100 py-3 rounded-3 text-start">
                  <i className="bi bi-bag-check-fill fs-4 float-start me-3 text-primary"></i>
                  <div>
                    <strong>Đơn hàng của tôi</strong><br />
                    <small className="text-muted">Xem lịch sử mua hàng</small>
                  </div>
                </a>
              </div>
              <div className="col-sm-6">
                <a href="/wishlist" className="btn btn-outline-dark w-100 py-3 rounded-3 text-start">
                  <i className="bi bi-heart-fill fs-4 float-start me-3 text-danger"></i>
                  <div>
                    <strong>Yêu thích</strong><br />
                    <small className="text-muted">Sản phẩm bạn quan tâm</small>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}