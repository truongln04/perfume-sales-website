export default function Dashboard() {
  return (
    <div
      className="p-4"
      style={{
        background: "linear-gradient(to right, #f8f9fa, #e3f2fd)",
        minHeight: "100vh",
      }}
    >
      <div className="text-center mb-4">
        <h2 className="text-primary fw-bold">🎉 Trang chủ Admin</h2>
        <p className="lead text-secondary">
          Chào mừng bạn đến với hệ thống quản trị 👑
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title text-success">👥 Tài khoản</h5>
              <p className="card-text">Quản lý người dùng, phân quyền và bảo mật.</p>
              <button className="btn btn-outline-success">Xem chi tiết</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title text-info">📦 Sản phẩm</h5>
              <p className="card-text">Thêm, sửa, xóa sản phẩm và tồn kho.</p>
              <button className="btn btn-outline-info">Xem chi tiết</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title text-warning">📊 Báo cáo</h5>
              <p className="card-text">Thống kê doanh thu, đơn hàng và hiệu suất.</p>
              <button className="btn btn-outline-warning">Xem chi tiết</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
