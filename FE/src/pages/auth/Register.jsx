import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [tenHienThi, setTenHienThi] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [nhapLai, setNhapLai] = useState("");
  const [sdt, setSdt] = useState("");
  const [anhDaiDien, setAnhDaiDien] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hiển thị lỗi (tự mất sau 5s)
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // === Client-side validation cơ bản ===
    if (!tenHienThi.trim()) return showError("Vui lòng nhập tên hiển thị");
    if (tenHienThi.trim().length < 3 || tenHienThi.trim().length > 33)
      return showError("Tên hiển thị phải từ 3 đến 33 ký tự");

    // Email: dùng đúng regex backend (hỗ trợ +, _, ., -)
    if (!email.trim()) return showError("Vui lòng nhập email");
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim()))
      return showError("Email không hợp lệ");

    // Số điện thoại: dùng đúng PHONE_PATTERN backend + bắt buộc nhập
    if (!sdt.trim()) return showError("Vui lòng nhập số điện thoại");
    if (!/^0[3|5|7|8|9]\d{8}$/.test(sdt.trim()))
      return showError("Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 và đúng 10 số");

    // Mật khẩu: dùng đúng PASSWORD_PATTERN backend
    if (!matKhau) return showError("Vui lòng nhập mật khẩu");
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(matKhau))
      return showError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số (có thể có ký tự đặc biệt)");

    if (matKhau !== nhapLai) return showError("Mật khẩu nhập lại không khớp");

    // === Gửi request ===
    const newUser = {
      tenHienThi: tenHienThi.trim(),
      email: email.trim().toLowerCase(),
      matKhau,
      sdt: sdt.trim(),
      anhDaiDien: anhDaiDien || null,
      vaiTro: "KHACHHANG",
    };

    try {
      const res = await fetch("http://localhost:8081/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend trả lỗi chuẩn: { message: "..." }
        const msg = data.message || "Đăng ký thất bại. Vui lòng thử lại!";
        showError(msg);
        return;
      }

      // Thành công
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      showError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
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
          {/* Hiển thị lỗi */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert"> {error}
            </div>
          )}
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
              onChange={e => setSdt(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập số điện thoại"
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