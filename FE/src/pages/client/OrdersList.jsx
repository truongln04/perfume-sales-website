import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả", color: "secondary" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận", color: "warning" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận", color: "info" },
  { key: "DANG_GIAO", label: "Đang giao", color: "primary" },
  { key: "GIAO_THAT_BAI", label: "Giao thất bại", color: "danger" },
  { key: "HOAN_THANH", label: "Hoàn thành", color: "success" },
  { key: "TRA_HANG", label: "Trả hàng", color: "dark" },
  { key: "HUY", label: "Hủy", color: "danger" },
];

const PAYMENT_METHOD_LABEL = { COD: "COD", ONLINE: "Online" };
const PAYMENT_STATUS_LABEL = {
  CHUA_THANH_TOAN: "Chưa thanh toán",
  DA_THANH_TOAN: "Đã thanh toán",
  HOAN_TIEN: "Hoàn tiền",
};

export default function OrdersList({ initialOrders = [] }) {
  const [activeTab, setActiveTab] = useState("ALL");
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8081/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Không tải được danh sách đơn hàng:", e);
      }
    };
    fetchOrders();
  }, []);

  // Khóa scroll khi mở modal
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
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8081/orders/${id}/status?trangThai=HUY`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Hủy đơn thất bại");
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
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
            title={`Xem đơn hàng ${tab.label}`}
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
                      {o.trangThai !== "HUY" && o.trangThai !== "HOAN_THANH" && (
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
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040 }}
            onClick={() => setSelectedOrder(null)}
          />
          <div
            className="position-fixed top-50 start-50 translate-middle"
            style={{ zIndex: 1050, width: "min(92vw, 960px)" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="card shadow-lg">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Chi tiết đơn hàng #{selectedOrder.id}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedOrder(null)}>
                  Đóng
                </button>
              </div>

              <div className="card-body">
                {/* Thông tin chung */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <p><strong>Người nhận:</strong> {selectedOrder.hoTenNhan}</p>
                    <p><strong>SĐT:</strong> {selectedOrder.sdtNhan}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.diaChiGiao}</p>
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

                {selectedOrder.ghiChu && <p className="mt-2"><strong>Ghi chú:</strong> {selectedOrder.ghiChu}</p>}

                {/* Sản phẩm trong đơn */}
<div className="mt-4">
  <h6 className="mb-3">Sản phẩm trong đơn</h6>
  {selectedOrder.chiTietDonHang?.length > 0 ? (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead className="table-light">
          <tr>
            <th>Tên SP</th>
            <th className="text-end">Số lượng</th>
            <th className="text-end">Đơn giá</th>
            <th className="text-end">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {selectedOrder.chiTietDonHang.map((d, i) => (
            <tr key={i}>
              <td className="fw-semibold">{d.tenSanPham}</td>
              <td className="text-end">{d.soLuong}</td>
              <td className="text-end">{d.donGia?.toLocaleString("vi-VN")} đ</td>
              <td className="text-end">{d.thanhTien?.toLocaleString("vi-VN")} đ</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-end fw-semibold">Tổng tiền</td>
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

              <div className="card-footer d-flex justify-content-end gap-2">
                
                <button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
