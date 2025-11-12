import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Gửi yêu cầu đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!email.trim()) {
      alert("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8081/auth/reset-password?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const msg = await res.text();
      if (!res.ok) {
        alert("❌ " + msg);
        return;
      }

      alert("✅ Mật khẩu mới đã được gửi đến email của bạn!");
      navigate("/login");
    } catch (err) {
      alert("⚠️ Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #f8f9fa, #e3f2fd)",
      }}
    >
      <div className="card shadow-lg p-4" style={{ maxWidth: 480, width: "100%" }}>
        <h3 className="text-center text-primary fw-bold mb-4">🔐 Quên mật khẩu</h3>

        <div className="mb-3">
          <label className="form-label">📧 Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
          />
        </div>

        <div className="d-grid gap-2 mt-3">
          <button
            className="btn btn-success"
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? "⏳ Đang gửi..." : "📤 Gửi mật khẩu mới"}
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/login")}
          >
            🔑 Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}