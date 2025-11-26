import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: gửi mã, 2: đặt lại mật khẩu
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Thêm state cho thông báo giao diện
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const showError = (msg) => {
    setError(msg);
    setSuccess("");
    setTimeout(() => setError(""), 8000);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 8000);
  };

  // Bước 1: gửi mã xác thực
  const handleSendResetLink = async () => {
    if (!email.trim()) return showError("Vui lòng nhập email!");

    try {
      setIsSending(true);

      const res = await fetch("http://localhost:8081/auth/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const msg = await res.text();

      if (!res.ok) {
        return showError(msg);
      }

      showSuccess("Mã xác thực đã được gửi đến email của bạn!");
      setStep(2);
    } catch (err) {
      showError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsSending(false);
    }
  };

  // Bước 2: đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) {
      return showError("Vui lòng nhập đầy đủ thông tin!");
    }

    try {
      const res = await fetch("http://localhost:8081/auth/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const msg = await res.text();

      if (!res.ok) {
        return showError(msg);
      }

      showSuccess("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
     <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(to right, #f8f9fa, #e3f2fd)" }}
    >
      <div className="card p-4" style={{ maxWidth: 480, width: "100%" }}>
        <h3 className="text-center mb-4">🔐 Quên mật khẩu</h3>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="alert alert-danger mb-3">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {/* Hiển thị thông báo thành công */}
        {success && (
          <div className="alert alert-success mb-3">
            {success}
          </div>
        )}


        {step === 1 && (
          <>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="btn btn-primary w-100"
              onClick={handleSendResetLink}
              disabled={isSending} // 🟠 Vô hiệu khi đang gửi
            >
              {isSending ? "⏳ Đang gửi..." : "📤 Gửi mã xác thực"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Nhập mã xác thực"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="btn btn-primary w-100" onClick={handleResetPassword}>
              🔑 Đặt lại mật khẩu
            </button>
          </>
        )}

        <button
          className="btn btn-outline-primary w-100 mt-2"
          onClick={() => navigate("/login")}
        >
          🔙 Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}