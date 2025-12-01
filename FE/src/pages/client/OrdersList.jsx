import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả", color: "secondary" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận", color: "warning" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận", color: "info" },
  { key: "DANG_GIAO", label: "Đang giao", color: "primary" },
  { key: "HOAN_THANH", label: "Hoàn thành", color: "success" },
  { key: "TRA_HANG", label: "Trả hàng", color: "dark" },
  { key: "HUY", label: "Hủy", color: "danger" },
];

const PAYMENT_METHOD_LABEL = { COD: "COD", ONLINE: "Online" };
const PAYMENT_STATUS_LABEL = {
  CHUA_THANH_TOAN: "Chưa thanh toán",
  DA_THANH_TOAN: "Đã thanh toán",
  HOAN_TIEN: "Hoàn tiền",
  DA_HOAN_TIEN: "Đã hoàn tiền",
};

export default function OrdersList() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = localStorage.getItem("token");

  // Lấy đơn hàng theo id tài khoản từ token
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) return;

        // gọi /auth/me để lấy thông tin user
        const resUser = await fetch("http://localhost:8081/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await resUser.json();
        const idTaiKhoan = user.idTaiKhoan;

        // gọi API lấy đơn hàng theo id tài khoản
        const resOrders = await fetch(`http://localhost:8081/orders/account/${idTaiKhoan}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resOrders.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Không tải được danh sách đơn hàng:", e);
      }
    };
    fetchOrders();
  }, [token]);

  useEffect(() => {
    document.body.style.overflow = selectedOrder ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    return orders.filter((o) => o.trangThai === activeTab);
  }, [orders, activeTab]);

  const handleCancel = async (id) => {
    if (!window.confirm("Xác nhận hủy đơn hàng?")) return;
    try {
      const res = await fetch(`http://localhost:8081/orders/${id}/status?trangThai=HUY`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Hủy đơn thất bại");
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setSelectedOrder(null);
    } catch (e) {
      alert("Không thể hủy đơn hàng.");
      console.error(e);
    }
  };
  const getStatusColor = (key) => STATUS_TABS.find((s) => s.key === key)?.color || "secondary";
  return (
    <div className="container py-4">
      {/* Tabs trạng thái */}
      <div className="mb-3 d-flex justify-content-center flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm btn-${activeTab === tab.key ? tab.color : "outline-" + tab.color}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bảng đơn hàng */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Mã ĐH</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Phương thức TT</th>
              <th>Người nhận</th>
              <th>SDT</th>
              <th>Địa chỉ</th>
              <th>Ghi chú</th>
              <th>Trạng thái TT</th>
              <th>Trạng thái ĐH</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-muted">
                  Không có đơn hàng
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.ngayDat ? new Date(o.ngayDat).toLocaleString() : "-"}</td>
                  <td>{o.tongTien?.toLocaleString() ?? 0} ₫</td>
                  <td>{PAYMENT_METHOD_LABEL[o.phuongThucTT] ?? o.phuongThucTT}</td>
                  <td>{o.hoTenNhan}</td>
                  <td>{o.sdtNhan}</td>
                  <td className="text-truncate" style={{ maxWidth: 220 }}>{o.diaChiGiao}</td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>{o.ghiChu}</td>
                  <td>{PAYMENT_STATUS_LABEL[o.trangThaiTT] ?? o.trangThaiTT}</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(o.trangThai)} text-uppercase`}>
                      {STATUS_TABS.find((s) => s.key === o.trangThai)?.label ?? o.trangThai}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedOrder(o)}>
                        Xem
                      </button>
                      {o.trangThai === "CHO_XAC_NHAN" && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(o.id)}>
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <>
          {/* Backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040 }}
            onClick={() => setSelectedOrder(null)}
          />

          {/* Modal */}
          <div
            className="position-fixed top-50 start-50 translate-middle"
            style={{
              zIndex: 2000, // cao hơn navbar (navbar thường z-index ~1030)
              width: "min(92vw, 960px)",
              maxHeight: "90vh", // giới hạn chiều cao
              overflowY: "auto", // cho phép cuộn nội dung
            }}
          >
            <div className="card shadow-lg">
              <div className="card-header d-flex justify-content-between align-items-center sticky-top bg-white">
                <h5 className="mb-0">Chi tiết đơn hàng #{selectedOrder.id}</h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)} />
              </div>

              <div className="card-body">
                {/* Thông tin chung */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <p><strong>Người nhận:</strong> {selectedOrder.hoTenNhan}</p>
                    <p><strong>SĐT:</strong> {selectedOrder.sdtNhan}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.diaChiGiao}</p>
                    <p > <strong>Ghi chú:</strong> {selectedOrder.ghiChu}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Ngày đặt:</strong> {selectedOrder.ngayDat ? new Date(selectedOrder.ngayDat).toLocaleString() : "-"}</p>
                    <p><strong>Phương thức TT:</strong> {PAYMENT_METHOD_LABEL[selectedOrder.phuongThucTT]}</p>
                    <p><strong>Trạng thái TT:</strong> {PAYMENT_STATUS_LABEL[selectedOrder.trangThaiTT]}</p>
                    <p>
                      <strong>Trạng thái ĐH:</strong>{" "}
                      <span className={`badge bg-${getStatusColor(selectedOrder.trangThai)}`}>
                        {STATUS_TABS.find((s) => s.key === selectedOrder.trangThai)?.label ?? selectedOrder.trangThai}
                      </span>
                    </p>
                  </div>
                </div>

               

                {/* Sản phẩm trong đơn */}
                <div className="mt-4">
                  <h6 className="mb-3">Sản phẩm trong đơn</h6>
                  {selectedOrder.chiTietDonHang?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Tên SP</th>
                            <th>Hình ảnh</th>
                            <th className="text-end">Số lượng</th>
                            <th className="text-end">Đơn giá</th>
                            <th className="text-end">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.chiTietDonHang.map((d, i) => (
                            <tr key={i}>
                              <td className="fw-semibold">{d.tenSanPham}</td>
                              <img
                                src={d.hinhAnh}
                                alt={d.tenSanPham}
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  borderRadius: "8px"
                                }}
                              />
                              <td className="text-end">{d.soLuong}</td>
                              <td className="text-end">{(d.donGia ?? 0).toLocaleString("vi-VN")} đ</td>
                              <td className="text-end">{(d.thanhTien ?? d.soLuong * d.donGia).toLocaleString("vi-VN")} đ</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="text-end fw-semibold">Tổng tiền</td>
                            <td className="text-end fw-semibold">
                              {(selectedOrder.tongTien ?? 0).toLocaleString("vi-VN")} đ
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted">Không có sản phẩm trong đơn.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
