import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    tenHienThi: "",
    sdt: "",
    anhDaiDien: ""
  });
  const [previewAvatar, setPreviewAvatar] = useState("");

  const navigate = useNavigate();

  // Lấy thông tin user
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
      .then((res) => {
        const data = res.data;
        setUser(data);
        setFormData({
          tenHienThi: data.tenHienThi || "",
          sdt: data.sdt || "",
          anhDaiDien: data.anhDaiDien || ""
        });
        setPreviewAvatar(data.anhDaiDien || "/default-avatar.png");
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin:", err);
        localStorage.removeItem("token");
        alert("Phiên đăng nhập hết hạn!");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Xử lý chọn ảnh
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreviewAvatar(base64);
      setFormData(prev => ({ ...prev, anhDaiDien: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Lưu thông tin
  const handleSave = async () => {
    if (!formData.tenHienThi.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token đang dùng:", token);
      console.log("User ID:", user.idTaiKhoan);

      // Gọi API cập nhật (dùng PUT /accounts/{id} hoặc /auth/me/update tùy bạn)
      await axios.put(
        `http://localhost:8081/auth/me`,
        {
          tenHienThi: formData.tenHienThi.trim(),
          sdt: formData.sdt.trim(),
          anhDaiDien: formData.anhDaiDien
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật lại user
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      setEditing(false);

      alert("Cập nhật thông tin thành công!");
      window.dispatchEvent(new Event("account-updated")); // Cập nhật Navbar, Checkout, v.v.
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("account-updated"));
      navigate("/login");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }}></div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className="container py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-person-circle text-muted" style={{ fontSize: "6rem" }}></i>
          <h3 className="mt-4">Bạn chưa đăng nhập</h3>
          <a href="/login" className="btn btn-primary btn-lg px-5 mt-3">
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "1000px" }}>
      <div className="row g-5">
        {/* Avatar + Nút chỉnh sửa */}
        <div className="col-lg-4 text-center">
          <div className="position-relative d-inline-block">
            <img
              src={previewAvatar}
              alt="Avatar"
              className="rounded-circle shadow-lg border border-5 border-white"
              width={220}
              height={220}
              style={{ objectFit: "cover" }}
            />

            {editing && (
              <label
                className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow"
                style={{ width: 56, height: 56, transform: "translate(30%, 30%)" }}
              >
                <i className="bi bi-camera-fill fs-4"></i>
                <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          <h3 className="mt-4 fw-bold text-primary">{user.tenHienThi || "Khách hàng"}</h3>
          <p className="text-muted fs-5">{user.email}</p>

          <div className="d-grid gap-3 mt-4">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-outline-primary rounded-pill py-2 btn-lg">
                <i className="bi bi-pencil-square me-2"></i>
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="btn btn-success btn-lg rounded-pill">
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary btn-lg rounded-pill">
                  Hủy
                </button>
              </>
            )}

            <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill py-2 btn-lg">
              <i className="bi bi-box-arrow-right me-2"></i>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Form thông tin */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <h3 className="fw-bold mb-5 text-primary">
                <i className="bi bi-person-lines-fill me-3"></i>
                Thông tin cá nhân
              </h3>

              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={formData.tenHienThi}
                    onChange={(e) => setFormData({ ...formData, tenHienThi: e.target.value })}
                    disabled={!editing}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={formData.sdt}
                    onChange={(e) => setFormData({ ...formData, sdt: e.target.value.replace(/\D/g, "") })}
                    disabled={!editing}
                    placeholder="0901234567"
                    maxLength={11}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg bg-light"
                    value={user.email}
                    disabled
                  />
                </div>
              </div>

              {editing && (
                <div className="alert alert-info mt-4">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Sau khi lưu, thông tin sẽ được cập nhật trên toàn hệ thống (Checkout, đơn hàng, v.v.)
                </div>
              )}

              <hr className="my-5" />

              <h5 className="fw-bold mb-4 text-primary">
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                Quản lý tài khoản
              </h5>

              <div className="row g-4">
                <div className="col-sm-6">
                  <a href="/orders" className="btn btn-outline-primary w-100 py-4 rounded-3 text-start shadow-sm">
                    <i className="bi bi-bag-check-fill fs-3 float-start me-3"></i>
                    <div>
                      <strong>Đơn hàng của tôi</strong><br />
                      <small className="text-muted">Xem và quản lý đơn hàng</small>
                    </div>
                  </a>
                </div>
                <div className="col-sm-6">
                  <a href="/wishlist" className="btn btn-outline-danger w-100 py-4 rounded-3 text-start shadow-sm">
                    <i className="bi bi-heart-fill fs-3 float-start me-3"></i>
                    <div>
                      <strong>Sản phẩm yêu thích</strong><br />
                      <small className="text-muted">Các sản phẩm bạn đã lưu</small>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}