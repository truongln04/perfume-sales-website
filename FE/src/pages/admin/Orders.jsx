import { useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([
    {
      id: "DH001",
      customer: "Nguyễn Văn A",
      date: "2025-11-01",
      total: 1200000,
      status: "Chờ xác nhận",
      details: [
        {
          product: "Nước hoa A",
          quantity: 2,
          price: 600000,
          image: "https://via.placeholder.com/60x60?text=A",
        },
      ],
    },
    {
      id: "DH002",
      customer: "Trần Thị B",
      date: "2025-11-02",
      total: 2200000,
      status: "Hoàn thành",
      details: [
        {
          product: "Nước hoa B",
          quantity: 1,
          price: 2200000,
          image: "https://via.placeholder.com/60x60?text=B",
        },
      ],
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    setShowDetail(false);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0">Quản lý Đơn hàng</h5>
       
      </div>

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
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.date}</td>
                <td>{o.total.toLocaleString("vi-VN")} đ</td>
                <td>
                  <select
                    className={
                      "form-select form-select-sm " +
                      (o.status === "Hoàn thành"
                        ? "border-success text-success"
                        : o.status === "Hủy"
                        ? "border-danger text-danger"
                        : "")
                    }
                    value={o.status}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
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
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleViewDetail(o)}
                  >
                    Chi tiết
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleStatusChange(o.id, "Hủy")}
                  >
                    Hủy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết đơn hàng */}
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
                <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
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
                        <td>{d.product}</td>
                        <td>
                          {d.image ? (
                            <img
                              src={d.image}
                              alt={d.product}
                              width={60}
                              height={60}
                              style={{ objectFit: "cover", borderRadius: 4 }}
                            />
                          ) : (
                            <span className="text-muted">Không có ảnh</span>
                          )}
                        </td>
                        <td>{d.quantity}</td>
                        <td>{d.price.toLocaleString("vi-VN")} đ</td>
                        <td>{(d.quantity * d.price).toLocaleString("vi-VN")} đ</td>
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
