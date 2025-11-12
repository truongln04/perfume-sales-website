import { useEffect, useState, useMemo } from "react";

function emptyOrder() {
  return {
    id: "",
    customer: "",
    date: "",
    total: 0,
    trangThai: "Chờ xác nhận",
    details: [],
  };
}

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

  // 🔍 Search theo tên khách hàng hoặc số điện thoại
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchOrders();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(value)}`, {
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

  // ✏️ Cập nhật trạng thái
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

  // 🔍 Xem chi tiết
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
          placeholder="Tìm theo khách hàng hoặc SDT..."
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
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.date}</td>
                <td>{o.total.toLocaleString("vi-VN")} đ</td>
                <td>
                  <select
                    className={`form-select form-select-sm ${
                      o.trangThai === "Hoàn thành"
                        ? "border-success text-success"
                        : o.trangThai === "Hủy"
                        ? "border-danger text-danger"
                        : ""
                    }`}
                    value={o.trangThai}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option>Chờ xác nhận</option>
                    <option>Đã xác nhận</option>
                    <option>Đang giao</option>
                    <option>Giao thất bại</option>
                    <option>Hoàn thành</option>
                    <option>Trả hàng</option>
                    <option>Hủy</option>
                  </select>
                </td>
                <td className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewDetail(o.id)}>
                    Chi tiết
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusChange(o.id, "Hủy")}>
                    Hủy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetail && selectedOrder && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết đơn hàng {selectedOrder.id}</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetail}></button>
              </div>
              <div className="modal-body">
                <p><strong>Khách hàng:</strong> {selectedOrder.customer}</p>
                <p><strong>Ngày đặt:</strong> {selectedOrder.date}</p>
                <p><strong>Tổng tiền:</strong> {selectedOrder.total.toLocaleString("vi-VN")} đ</p>
                <p><strong>Trạng thái:</strong> {selectedOrder.trangThai}</p>
                <hr />
                <h6>Sản phẩm:</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Tên SP</th>
                      <th>Ảnh</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.details.map((d, i) => (
                      <tr key={i}>
                        <td>{d.tenSanPham}</td>
                        <td>
                          {d.image ? (
                            <img
                              src={d.image}
                              alt={d.tenSanPham}
                              width={60}
                              height={60}
                              style={{ objectFit: "cover", borderRadius: 4 }}
                            />
                          ) : (
                            <span className="text-muted">Không có ảnh</span>
                          )}
                        </td>
                        <td>{d.soLuong}</td>
                        <td>{d.donGia.toLocaleString("vi-VN")} đ</td>
                        <td>{d.thanhTien.toLocaleString("vi-VN")} đ</td>
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