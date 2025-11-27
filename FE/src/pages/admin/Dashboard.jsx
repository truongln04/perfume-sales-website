import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    taiKhoan: 0,
    sanPham: 0,
    donHangMoi: 0,
    doanhThu: 0,
  });

  useEffect(() => {
  const token = localStorage.getItem("token"); // hoặc lấy từ context/store

  fetch("http://localhost:8081/dashboard/stats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // thêm token vào header
    }
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Unauthorized or server error");
      }
      return res.json();
    })
    .then((data) => setStats(data))
    .catch((err) => console.error("Error fetching stats:", err));
}, []);

  return (
    <div
      className="p-5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
      }}
    >
      <div className="text-center mb-5">
        <h1 className="fw-bold text-dark display-4">Quản trị hệ thống</h1>
        <p className="text-muted fs-5">
          Chào mừng bạn đến với bảng điều khiển quản lý nước hoa
        </p>
        <p className="fst-italic text-secondary">
          🌸 “Sự tinh tế nằm trong từng giọt hương” 🌸
        </p>
      </div>

      {/* --- DASHBOARD CARDS --- */}
      <div className="row g-4 px-3">
        <div className="col-md-3">
          <div className="shadow rounded p-4 bg-white text-center">
            <h3 className="fw-bold text-primary">{stats.taiKhoan}</h3>
            <p className="m-0 text-muted">Tài khoản</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="shadow rounded p-4 bg-white text-center">
            <h3 className="fw-bold text-danger">{stats.sanPham}</h3>
            <p className="m-0 text-muted">Sản phẩm</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="shadow rounded p-4 bg-white text-center">
            <h3 className="fw-bold text-success">{stats.donHangMoi}</h3>
            <p className="m-0 text-muted">Đơn hàng mới</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="shadow rounded p-4 bg-white text-center">
            <h3 className="fw-bold text-warning">
              {stats.doanhThu.toLocaleString("vi-VN")} đ
            </h3>
            <p className="m-0 text-muted">Doanh thu</p>
          </div>
        </div>
      </div>

      {/* --- ANNOUNCEMENT --- */}
      <div className="card shadow-sm mt-5">
        <div className="card-body text-center">
          <h5 className="text-primary fw-bold">📢 Thông báo hệ thống</h5>
          <p className="text-muted">
            Hãy kiểm tra lại kho hàng định kỳ để đảm bảo chất lượng sản phẩm.
          </p>
          <p className="text-muted">
            Đừng quên cập nhật thương hiệu mới để khách hàng có thêm lựa chọn.
          </p>
        </div>
      </div>

      {/* --- INSPIRATION QUOTE --- */}
      <div className="mt-4 text-center">
        <blockquote className="blockquote">
          <p className="mb-0">
            “Quản lý tốt là nghệ thuật biến sự phức tạp thành đơn giản.”
          </p>
          <br />
          
        </blockquote>
      </div>
    </div>
  );
}
