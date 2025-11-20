import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // 🔸 Đăng nhập bằng tài khoản thông thường
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: matKhau }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Sai tài khoản hoặc mật khẩu!");
        return;
      }

      const user = await res.json();
      const role = user.vaiTro?.toUpperCase();

      // ✅ Lưu user
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.token); // ✅ lưu token để dùng cho các API sau

      // ✅ Cập nhật state user ở App.jsx để component render lại ngay
      if (onLogin) onLogin(user);

      // ✅ Điều hướng theo vai trò
      if (role === "ADMIN" || role === "NHANVIEN") {
        alert("Đăng nhập quản trị thành công!");
        navigate("/");
      } else if (role === "KHACHHANG") {
        alert("Đăng nhập khách hàng thành công!");
        navigate("/");
      } else {
        alert("Không xác định quyền truy cập!");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    }
  };

  // 🔸 Đăng nhập Google thật
  const handleGoogleLogin = async (credentialResponse) => {
  try {
    // ✅ Lấy token Google do SDK trả về
    const credential = credentialResponse.credential;

    console.log("Google Credential:", credential);

    // ✅ Gửi token Google lên backend để xác minh và xử lý user
    const res = await fetch("http://localhost:8081/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }), // Gửi thô credential
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể đăng nhập với Google");
    }

    const savedUser = await res.json();

    // ✅ Lưu user và token (nếu backend trả token JWT)
    localStorage.setItem("user", JSON.stringify(savedUser));
    localStorage.setItem("token", savedUser.token);

    // ✅ Cập nhật state / context
    if (onLogin) onLogin(savedUser);

    // ✅ Thông báo và điều hướng
    alert("Đăng nhập Google thành công!");
    navigate("/");

    // ✅ Kích hoạt sự kiện để component khác reload
    window.dispatchEvent(new Event("account-updated"));
  } catch (err) {
    alert("Lỗi khi đăng nhập Google: " + err.message);
    console.error("Lỗi đăng nhập Google:", err);
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