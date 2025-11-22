import { useEffect, useState, useMemo } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const API_URL = "http://localhost:8081/orders";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  // 📋 Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setMessage({ text: "❌ Không thể tải danh sách đơn hàng", type: "error" });
    }
  };

  // 🔍 Search theo tên người nhận hoặc số điện thoại
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchOrders();
      return;
    }
    try {
      // Nếu người dùng nhập toàn số → tìm theo SDT, ngược lại tìm theo họ tên
    const isPhone = /^[0-9]+$/.test(value.trim());
    const queryParam = isPhone
      ? `sdtNhan=${encodeURIComponent(value)}`
      : `hoTenNhan=${encodeURIComponent(value)}`;

    const res = await fetch(`${API_URL}/search?${queryParam}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(data);
      if (data.length === 0) {
        setMessage({ text: "❌ Không tìm thấy đơn hàng", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      }
    } catch (err) {
      console.error("Search failed", err);
      setMessage({ text: "❌ Lỗi khi tìm kiếm", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    }
  };

  const filtered = useMemo(() => {
    return [...orders].sort((a, b) => a.id - b.id);
  }, [orders]);

  // ✏️ Cập nhật trạng thái đơn hàng
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status?trangThai=${encodeURIComponent(newStatus)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, trangThai: newStatus } : o)));
      setMessage({ text: "✅ Cập nhật trạng thái thành công!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ " + err.message, type: "error" });
    }
  };

  // 🧾 Cập nhật trạng thái thanh toán
  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(
        `${API_URL}/${id}/payment-status?trangThaiTT=${encodeURIComponent(newStatus)}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setOrders((prev) => prev.map((o) =>
        o.id === id ? { ...o, trangThaiTT: newStatus } : o
      ));

      setMessage({ text: "💰 Cập nhật trạng thái thanh toán thành công!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ " + err.message, type: "error" });
    }
  };

  // 🔍 Xem chi tiết đơn hàng
  const handleViewDetail = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSelectedOrder(data);
      setShowDetail(true);
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ Không thể tải chi tiết đơn hàng", type: "error" });
    }
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    setShowDetail(false);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0">Quản lý Đơn hàng</h5>
        <input
          type="text"
          className="form-control form-control-sm w-25"
          placeholder="Tìm theo tên hoặc SDT..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"} m-2`}>
          {message.text}
        </div>
      )}

      <div className="card-body p-0">
        <table className="table table-hover table-striped m-0">
          <thead className="table-light">
            <tr>
              <th>Mã ĐH</th>
              <th>Người nhận</th>
              <th>SĐT</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Phương thức TT</th>
              <th>Trạng thái TT</th>
              <th>Trạng thái</th>
              <th>Địa chỉ giao</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.hoTenNhan}</td>
                <td>{o.sdtNhan}</td>
                <td>{new Date(o.ngayDat).toLocaleString("vi-VN")}</td>
                <td>{o.tongTien?.toLocaleString("vi-VN")} đ</td>
                <td>{o.phuongThucTT}</td>
                <td>
  {o.trangThaiTT === "DA_THANH_TOAN" ? (
    // ĐÃ THANH TOÁN → chỉ được chọn "HOÀN TIỀN", không được về "Chưa thanh toán"
    <select
      className="form-select form-select-sm border-success text-success"
      value={o.trangThaiTT}
      onChange={(e) => handlePaymentStatusChange(o.id, e.target.value)}
    >
      <option value="DA_THANH_TOAN">Đã Thanh Toán</option>
      <option value="HOAN_TIEN">Hoàn tiền</option>
    </select>
  ) : o.trangThaiTT === "HOAN_TIEN" ? (
    // ĐÃ HOÀN TIỀN → khóa chết, không sửa được nữa
    <span className="badge bg-danger text-white px-3 py-2 rounded">
      ĐÃ HOÀN TIỀN
    </span>
  ) : (
    // CHƯA THANH TOÁN → cho chọn bình thường
    <select
      className="form-select form-select-sm border-warning"
      value={o.trangThaiTT}
      onChange={(e) => handlePaymentStatusChange(o.id, e.target.value)}
    >
      <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
      <option value="DA_THANH_TOAN">Đã thanh toán</option>
      <option value="HOAN_TIEN">Hoàn tiền</option>
    </select>
  )}
</td>
               <td>
  {/* Các trạng thái KẾT THÚC → hiển thị badge đẹp, KHÔNG cho sửa */}
  {["HOAN_THANH", "HUY", "TRA_HANG"].includes(o.trangThai) ? (
    <span
      className={`badge px-4 py-2 rounded-pill fw-bold ${
        o.trangThai === "HOAN_THANH"
          ? "bg-success"
          : o.trangThai === "HUY"
          ? "bg-secondary"
          : "bg-danger"
      }`}
    >
      {o.trangThai === "HOAN_THANH" && "HOÀN THÀNH"}
      {o.trangThai === "HUY" && "ĐÃ HỦY"}
      {o.trangThai === "TRA_HANG" && "ĐÃ TRẢ HÀNG"}
    </span>
  ) : (
    /* Các trạng thái đang xử lý → chỉ hiện các option hợp lệ */
    <select
      className="form-select form-select-sm"
      value={o.trangThai}
      onChange={(e) => {
        const newStatus = e.target.value;

        // Xác nhận khi hủy đơn
        if (newStatus === "HUY") {
          if (window.confirm("Bạn có chắc chắn muốn HỦY đơn hàng này không?")) {
            handleStatusChange(o.id, newStatus);
          }
          return;
        }

        // Xác nhận khi trả hàng (chỉ từ Hoàn thành)
        if (newStatus === "TRA_HANG") {
          if (window.confirm("Xác nhận khách đã TRẢ HÀNG và bạn muốn hoàn tiền?")) {
            handleStatusChange(o.id, newStatus);
          }
          return;
        }

        // Các chuyển trạng thái bình thường
        handleStatusChange(o.id, newStatus);
      }}
    >
      {/* 1. Chờ xác nhận */}
      {o.trangThai === "CHO_XAC_NHAN" && (
        <>
          <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
          <option value="DA_XAC_NHAN">Đã xác nhận</option>
          <option value="HUY">Hủy đơn</option>
        </>
      )}

      {/* 2. Đã xác nhận */}
      {o.trangThai === "DA_XAC_NHAN" && (
        <>
          <option value="DA_XAC_NHAN">Đã xác nhận</option>
          <option value="DANG_GIAO">Đang giao</option>
          <option value="HUY">Hủy đơn</option>
        </>
      )}

      {/* 3. Đang giao */}
      {o.trangThai === "DANG_GIAO" && (
        <>
          <option value="DANG_GIAO">Đang giao</option>
          <option value="HOAN_THANH">Giao thành công</option>
          <option value="HUY">Hủy đơn</option>
        </>
      )}

      {/* 4. Hoàn thành → chỉ được trả hàng */}
      {o.trangThai === "HOAN_THANH" && (
        <>
          <option value="HOAN_THANH">HOÀN THÀNH</option>
          <option value="TRA_HANG">Khách trả hàng</option>
        </>
      )}
    </select>
  )}
</td>
                <td>{o.diaChiGiao}</td>
                <td>{o.ghiChu || "Không có"}</td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewDetail(o.id)}>
                    Chi tiết
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusChange(o.id, "HUY")}>
                    Hủy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧾 Modal chi tiết đơn hàng */}
      {showDetail && selectedOrder && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng #{selectedOrder.id}</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetail}></button>
              </div>
              <div className="modal-body">
                <h6>Danh sách sản phẩm:</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Tên SP</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.chiTietDonHang?.map((d, i) => (
                      <tr key={i}>
                        <td>{d.tenSanPham}</td>
                        <td>{d.soLuong}</td>
                        <td>{d.donGia?.toLocaleString("vi-VN")} đ</td>
                        <td>{d.thanhTien?.toLocaleString("vi-VN")} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseDetail}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}