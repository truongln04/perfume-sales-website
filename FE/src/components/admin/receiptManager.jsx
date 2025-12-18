import React from "react";

export default function ReceiptManager({
  receipts,
  products,
  suppliers,
  form,
  editing,
  handleChange,
  search,
  showModal,
  selectedReceipt,
  onAdd,
  onEdit,
  onDelete,
  onChange,
  onDetailChange,
  onAddDetail,
  onRemoveDetail,
  onSave,
  onClose,
  onSearch,
  onView,
  onCloseView,
  message,
}) {
  // const filtered = receipts.filter(r =>
  //   r.idPhieuNhap.toString().includes(search.toLowerCase()) ||
  //   r.tenNhaCungCap.toLowerCase().includes(search.toLowerCase())
  // );

  const calculateTotal = form.details.reduce((sum, d) => {
    const sl = parseInt(d.soLuong) || 0;
    const dg = parseFloat(d.donGia) || 0;
    return sum + sl * dg;
  }, 0);

  const filteredProducts = form.idNcc
    ? products.filter(p => String(p.idNcc) === String(form.idNcc))
    : products;


  const getProductInfo = id => products.find(p => p.idSanPham === parseInt(id));

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0 text-primary fw-bold">Quản lý phiếu nhập</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={onAdd}>Thêm mới</button>
          <input
            className="form-control"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            style={{ width: 260 }}
          />
        </div>
      </div>
      {message.type === "success" && message.text && (
        <div className="m-3 py-2 px-3 rounded bg-success text-white">
          {message.text}
        </div>
      )}
      {message.type === "error" && message.text && (
        <div className="m-3 py-2 px-3 rounded bg-danger text-white">
          {message.text}
        </div>
      )}
      {/* Table danh sách phiếu nhập */}
      <div className="card-body p-0">
        <table className="table table-striped m-0">
          <thead className="table-light">
            <tr>
              <th>Mã PN</th>
              <th>Ngày nhập</th>
              <th>Tổng tiền</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Không có dữ liệu</td>
              </tr>
            ) : (
              receipts.map(r => (
                <tr key={r.idPhieuNhap}>
                  <td>{r.idPhieuNhap}</td>
                  <td>{new Date(r.ngayNhap).toLocaleDateString("vi-VN")}</td>
                  <td>{r.tongTien.toLocaleString("vi-VN")} đ</td>
                  <td>{r.ghiChu || "Không có ghi chú"}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={() => onView(r)}>Xem chi tiết</button>
                    {/* <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(r)}>Sửa</button> */}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(r.idPhieuNhap)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa phiếu nhập */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Sửa phiếu nhập" : "Thêm phiếu nhập"}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                {message.type === "error" && message.text && (
                  <div className="alert alert-danger py-2">{message.text}</div>
                )}
                {/* Form thông tin phiếu nhập */}
                <div className="mb-3">
                  <label className="form-label">Nhà cung cấp</label>
                  {editing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={form.tenNcc || "LỖI TÊN NHÀ CUNG CẤP"}
                      disabled
                    />
                  ) : (
                    <select
                      className="form-select"
                      name="idNcc"
                      value={form.idNcc}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {suppliers.map(s => (
                        <option key={s.idNcc} value={s.idNcc}>
                          {s.idNcc} - {s.tenNcc}
                        </option>
                      ))}
                    </select>
                  )}

                </div>

                <div className="mb-3">
                  <label className="form-label">Ngày nhập</label>
                  <input
                    type="date"
                    className="form-control"
                    name="ngayNhap"
                    value={form.ngayNhap}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    name="ghiChu"
                    rows={3}
                    value={form.ghiChu ?? "Không có ghi chú"}
                    onChange={handleChange}
                  />
                </div>

                {/* Chi tiết sản phẩm nhập */}
                <h6>Chi tiết sản phẩm nhập</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.details.map((d, i) => {
                      const info = getProductInfo(d.idSanPham);
                      return (
                        <tr key={i}>
                          <td>
                            {editing ? (
                              <input
                                type="text"
                                className="form-control"
                                value={d.tenSanPham || ""}
                                disabled
                              />
                            ) : (
                              <select
                                className="form-select"
                                value={d.idSanPham}
                                onChange={e => {
                                  const id = parseInt(e.target.value); // ✔ convert string → number
                                  onDetailChange(i, "idSanPham", id);

                                  const selected = products.find(p => p.idSanPham === id); // ✔ tìm đúng
                                  if (selected) {
                                    onDetailChange(i, "donGia", selected.giaNhap || 0);      // ✔ lấy giá nhập
                                    onDetailChange(i, "tenSanPham", selected.tenSanPham);    // ✔ lấy tên
                                  }
                                }}
                              >

                                <option value="">-- Chọn sản phẩm --</option>
                                {filteredProducts.map(p => (
                                  <option key={p.idSanPham} value={p.idSanPham}>
                                    {p.idSanPham} - {p.tenSanPham}
                                  </option>
                                ))}

                              </select>
                            )}

                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={d.soLuong}
                              onChange={e => onDetailChange(i, "soLuong", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={d.donGia}
                              onChange={e => onDetailChange(i, "donGia", e.target.value)}
                            />
                          </td>
                          <td>{(d.soLuong * d.donGia).toLocaleString("vi-VN")} đ</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => onRemoveDetail(i)}>X</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button className="btn btn-sm btn-outline-success" onClick={onAddDetail}>+ Thêm dòng</button>

                <div className="mt-3 text-end fw-bold">
                  Tổng tiền: {calculateTotal.toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
                <button className="btn btn-primary" onClick={onSave}>Lưu phiếu nhập</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết phiếu nhập */}
      {selectedReceipt && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết phiếu nhập #{selectedReceipt.idPhieuNhap}</h5>
                <button type="button" className="btn-close" onClick={onCloseView}></button>
              </div>
              <div className="modal-body">
                <p><strong>Ngày nhập:</strong> {new Date(selectedReceipt.ngayNhap).toLocaleDateString("vi-VN")}</p>
                <p><strong>Ghi chú:</strong> {selectedReceipt.ghiChu ?? "Không có ghi chú"}</p>
                <p><strong>Tổng tiền:</strong> {selectedReceipt.tongTien.toLocaleString("vi-VN")} đ</p>

                <h6 className="mt-3">Chi tiết sản phẩm:</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.chiTietPhieuNhap?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.tenSanPham}</td>
                        <td>{item.soLuong}</td>
                        <td>{item.donGia.toLocaleString("vi-VN")} đ</td>
                        <td>{(item.soLuong * item.donGia).toLocaleString("vi-VN")} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onCloseView}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}