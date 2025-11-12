import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: gửi mã, 2: đặt lại mật khẩu
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSending, setIsSending] = useState(false); // 🟢 Thêm state cho trạng thái gửi
  const navigate = useNavigate();

  // Bước 1: gửi mã xác thực
  const handleSendResetLink = async () => {
    if (!email.trim()) {
      alert("Vui lòng nhập email!");
      return;
    }

    try {
      setIsSending(true); // 🟡 Bắt đầu gửi
      const res = await fetch("http://localhost:8081/auth/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const msg = await res.text();
      if (!res.ok) {
        alert("❌ " + msg);
        return;
      }

      alert("✅ Mã xác thực đã được gửi đến email của bạn.");
      setStep(2);
    } catch (err) {
      alert("⚠️ Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsSending(false); // 🔵 Dừng trạng thái gửi
    }
  };

  // Bước 2: đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/auth/confirm-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const msg = await res.text();
      if (!res.ok) {
        alert("❌ " + msg);
        return;
      }

      alert("✅ Mật khẩu đã được đặt lại thành công!");
      navigate("/login");
    } catch (err) {
      alert("⚠️ Lỗi kết nối máy chủ: " + err.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card p-4" style={{ maxWidth: 480, width: "100%" }}>
        <h3 className="text-center mb-4">🔐 Quên mật khẩu</h3>

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
              className="btn btn-success w-100"
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
            <button className="btn btn-success w-100" onClick={handleResetPassword}>
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