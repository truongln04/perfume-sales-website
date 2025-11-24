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

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [previewAvatar, setPreviewAvatar] = useState("");
  const navigate = useNavigate();

  // Kiểm tra có phải tài khoản Google không
  const isGoogleAccount = user?.googleId || user?.anhDaiDien?.includes("googleusercontent.com");

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

  // Lưu toàn bộ (hồ sơ + đổi mật khẩu nếu có)
  const handleSave = async () => {
    if (!formData.tenHienThi.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    // Kiểm tra đổi mật khẩu (nếu người dùng nhập)
    if (passwordData.newPassword || passwordData.oldPassword) {
      if (!passwordData.oldPassword) {
        alert("Vui lòng nhập mật khẩu cũ!");
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("Mật khẩu mới và xác nhận không khớp!");
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Gửi cả thông tin cá nhân + đổi mật khẩu (nếu có)
      const updatePayload = {
        tenHienThi: formData.tenHienThi.trim(),
        sdt: formData.sdt.trim() || null,
        anhDaiDien: formData.anhDaiDien || null,
        ...(passwordData.oldPassword && {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      };

      await axios.put("http://localhost:8081/auth/me", updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      setEditing(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // reset form mật khẩu

      alert("Cập nhật thông tin thành công!");
      window.dispatchEvent(new Event("account-updated"));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert("Cập nhật thất bại: " + msg);
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

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (!user) return <div className="text-center py-5"><h3>Bạn chưa đăng nhập</h3><a href="/login" className="btn btn-primary">Đăng nhập</a></div>;

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
              <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow"
                     style={{ width: 56, height: 56, transform: "translate(30%, 30%)" }}>
                <i className="bi bi-camera-fill fs-4"></i>
                <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          <h3 className="mt-4 fw-bold text-primary">{user.tenHienThi || "Khách hàng"}</h3>
          <p className="text-muted fs-5">{user.email}</p>

          <div className="d-grid gap-2 mt-4">
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
                <button onClick={() => {
                  setEditing(false);
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }} className="btn btn-secondary btn-lg rounded-pill">
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

        {/* Form thông tin + đổi mật khẩu */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <h3 className="fw-bold mb-5 text-primary">
                <i className="bi bi-person-lines-fill text-primary me-3"></i>
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
                    placeholder="Nhập số điện thoại"
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

              {/* FORM ĐỔI MẬT KHẨU - CHỈ HIỆN KHI ĐANG CHỈNH SỬA + KHÔNG PHẢI GOOGLE */}
              {editing && !isGoogleAccount && (
                <>
                  <hr className="my-5" />
                  <h5 className="fw-bold text-primary mb-4">
                    <i className="bi bi-shield-lock me-2"></i>
                    Đổi mật khẩu (tùy chọn)
                  </h5>
                  <div className="row g-4 bg-light p-4 rounded">
                    <div className="col-12">
                      <label className="form-label fw-bold">Mật khẩu cũ</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        placeholder="Để trống nếu không đổi mật khẩu"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Mật khẩu mới</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>
                </>
              )}

              {editing && isGoogleAccount && (
                <div className="alert alert-light border mt-4">
                  <i className="bi bi-google me-2"></i>
                  Bạn đang dùng tài khoản Google. Không thể đổi mật khẩu tại đây.
                </div>
              )}

              <hr className="my-5" />

              <h5 className="fw-bold mb-4 text-primary">
                <i className="bi bi-grid-3x3-gap-fill text-primary me-2"></i>
                Quản lý tài khoản
              </h5>

              <div className="row g-4">
                <div className="col-sm-6">
                  <a href="/orderslist" className="btn btn-outline-primary w-100 py-4 rounded-3 text-start shadow-sm">
                    <i className="bi bi-bag-check-fill fs-3 float-start me-3"></i>
                    <div>
                      <strong>Đơn hàng của tôi</strong><br />
                      <small className="text-muted">Xem lịch sử mua hàng</small>
                    </div>
                  </a>
                </div>
                <div className="col-sm-6">
                  <a href="/#" className="btn btn-outline-danger w-100 py-4 rounded-3 text-start shadow-sm">
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