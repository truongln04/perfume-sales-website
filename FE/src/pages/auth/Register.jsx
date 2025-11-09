import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [tenHienThi, setTenHienThi] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [sdt, setSdt] = useState("");
  const [anhDaiDien, setAnhDaiDien] = useState("");
  const [nhapLai, setNhapLai] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!tenHienThi.trim() || !email.trim() || !matKhau.trim()) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (matKhau !== nhapLai) {
      alert("❌ Mật khẩu không khớp!");
      return;
    }

    const newUser = {
  tenHienThi: tenHienThi,   
  email: email,
  matKhau: matKhau,
  sdt: sdt,                 
  anhDaiDien: anhDaiDien,   
  vaiTro: "KHACHHANG",
};

    try {
      const res = await fetch("http://localhost:8081/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "❌ Đăng ký thất bại!");
        return;
      }

      alert("✅ Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      alert("⚠️ Lỗi kết nối máy chủ: " + err.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(to right, #f8f9fa, #e3f2fd)" }}
    >
      <div className="row shadow-lg rounded overflow-hidden bg-white" style={{ maxWidth: 900, width: "100%" }}>
        {/* Đăng ký */}
        <div className="col-md-6 p-5">
          <h3 className="mb-4 text-center text-primary fw-bold">Đăng kí</h3>
          <div className="mb-3">
            <label className="form-label">👤 Họ và tên</label>
            <input
              className="form-control"
              value={tenHienThi}
              onChange={e => setTenHienThi(e.target.value)}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">📧 Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email"
            />
          </div>
          <div className="mb-3">
      <label className="form-label">📱 Số điện thoại</label>
      <input
        type="text"
        className="form-control"
        value={sdt}
        onChange={e => setSdt(e.target.value)}
        placeholder="Nhập số điện thoại"
      />
    </div>

    <div className="mb-3">
      <label className="form-label">🖼️ Ảnh đại diện (URL)</label>
      <input
        type="text"
        className="form-control"
        value={anhDaiDien}
        onChange={e => setAnhDaiDien(e.target.value)}
        placeholder="Nhập đường dẫn ảnh"
      />
    </div>
          <div className="mb-3">
            <label className="form-label">🔒 Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={matKhau}
              onChange={e => setMatKhau(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">🔁 Nhập lại mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={nhapLai}
              onChange={e => setNhapLai(e.target.value)}
              placeholder="Nhập lại mật khẩu"
            />
          </div>
          <div className="d-grid">
            <button className="btn btn-primary" onClick={handleRegister}>✍️ Đăng kí</button>
          </div>
        </div>

        {/* Lời chào / quay lại */}
        <div
          className="col-md-6 bg-light d-flex flex-column justify-content-center align-items-center text-center p-5"
          style={{ background: "linear-gradient(to bottom right, #dfe9f3, #ffffff)" }}
        >
          <h3 className="mb-2 text-dark">👋 Chào mừng bạn</h3>
          <p className="mb-4 text-muted">Nếu đã có tài khoản, hãy đăng nhập để tiếp tục</p>
          <button className="btn btn-outline-primary px-4" onClick={() => navigate("/login")}>
            🔑 Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}