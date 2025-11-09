import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email.trim() || !matKhauMoi.trim()) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu mới!");
      return;
    }

    try {
      // Gửi email + mật khẩu mới lên backend
      const res = await fetch(
        `http://localhost:8081/auth/forgotpassword?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(matKhauMoi)}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const errData = await res.text().catch(() => "Lỗi không xác định");
        alert("❌ " + errData);
        return;
      }

      const msg = await res.text();
      alert("✅ " + msg);
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
      <div className="card shadow-lg p-4" style={{ maxWidth: 480, width: "100%" }}>
        <h3 className="text-center text-primary fw-bold mb-4">🔐 Quên mật khẩu</h3>
        <div className="mb-3">
          <label className="form-label">📧 Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">🔒 Mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            value={matKhauMoi}
            onChange={e => setMatKhauMoi(e.target.value)}
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success" onClick={handleReset}>📤 Gửi yêu cầu</button>
          <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>🔑 Quay lại đăng nhập</button>
        </div>
      </div>
    </div>
  );
}
