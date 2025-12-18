import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // State để hiển thị lỗi đẹp
  const navigate = useNavigate();

  // Hàm hiển thị lỗi (có thể thay bằng toastify sau)
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000); // Tự mất sau 5 giây
  };

  // Đăng nhập bằng email + mật khẩu
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return showError("Vui lòng nhập email");
    if (!matKhau) return showError("Vui lòng nhập mật khẩu");

    try {
      const res = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: matKhau }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend trả lỗi chuẩn: { message: "...", status: 400 }
        const errorMsg = data.message || "Đăng nhập thất bại. Vui lòng thử lại!";
        showError(errorMsg);
        return;
      }

      // Thành công
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      console.log("credential:", data.token);

      if (onLogin) onLogin(data);

      const role = data.vaiTro?.toUpperCase();
      if (role === "ADMIN" || role === "NHANVIEN") {
        alert("Đăng nhập quản trị thành công!");
      } 
      else {
        alert("Đăng nhập không thành công!");
      }
      navigate("/");
    } catch (err) {
      showError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      console.error("Login error:", err);
    }
  };

  // Đăng nhập Google
  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        showError("Không nhận được thông tin từ Google");
        return;
      }

      const res = await fetch("http://localhost:8081/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || "Đăng nhập Google thất bại";
        showError(errorMsg);
        return;
      }

      // Thành công
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      console.log("credential:", data.token);
      if (onLogin) onLogin(data);

      alert("Đăng nhập với Google thành công!");
      navigate("/");
      window.dispatchEvent(new Event("account-updated"));
    } catch (err) {
      showError("Lỗi khi kết nối với máy chủ Google");
      console.error("Google login error:", err);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "linear-gradient(to right, #f8f9fa, #e3f2fd)" }}
    >
      <div className="row shadow-lg rounded overflow-hidden bg-white" style={{ maxWidth: 900, width: "100%" }}>
        {/* Đăng nhập */}
        <div className="col-md-6 p-5">
          <h3 className="mb-4 text-center text-primary fw-bold">Đăng nhập</h3>
          {error && <div className="alert alert-danger">{error}</div>}
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
            <label className="form-label">🔒 Mật khẩu</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={matKhau}
                onChange={e => setMatKhau(e.target.value)}
                placeholder="Nhập mật khẩu"
              />
              <span
                className="input-group-text"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </span>
            </div>
          </div>

          <div className="mb-3 text-end">
            <button className="btn btn-link p-0" onClick={() => navigate("/forgotpassword")}>
              Quên mật khẩu?
            </button>
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleLogin}>
              🔑 Đăng nhập
            </button>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert("Đăng nhập Google thất bại")}
              shape="pill"
              style={{ width: "100%" }}
              text="signin_with"
              locale="vi"
            />
          </div>
        </div>

        {/* Đăng ký */}
        <div
          className="col-md-6 bg-light d-flex flex-column justify-content-center align-items-center text-center p-5"
          style={{ background: "linear-gradient(to bottom right, #dfe9f3, #ffffff)" }}
        >
          <h3 className="mb-2 text-dark">👋 Xin chào</h3>
          <p className="mb-4 text-muted">Đăng kí để tham gia cùng chúng tôi</p>
          <button className="btn btn-outline-primary px-4" onClick={() => navigate("/register")}>
            ✍️ Đăng kí
          </button>
        </div>
      </div>
    </div>
  );
}