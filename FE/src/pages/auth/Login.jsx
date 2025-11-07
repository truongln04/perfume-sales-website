import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    let role = "staff";
    if (email === "admin@example.com" && matKhau === "admin123") {
      role = "admin";
    } else if (email === "staff@example.com" && matKhau === "staff123") {
      role = "staff";
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
      return;
    }

    localStorage.setItem("user", JSON.stringify({ email, role }));
    alert("Đăng nhập thành công!");
    navigate("/Dashboard");
  };

  const handleGoogleLogin = () => {
    alert("Đăng nhập bằng Google (giả lập)");
    navigate("/Dashboard");
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
            <button className="btn btn-danger" onClick={handleGoogleLogin}>
              <i className="bi bi-google me-2"></i>Đăng nhập bằng Google
            </button>
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
