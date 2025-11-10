import React from "react";

export default function ReceiptManager({
  receipts,
  products,
  suppliers,
  form,
  editing,
  search,
  showModal,
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
}) {
  const filtered = receipts.filter(r =>
    r.idPhieuNhap.toString().includes(search.toLowerCase()) ||
    r.tenNhaCungCap.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0">Quản lý Phiếu nhập</h5>
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

      <div className="card-body p-0">
        <table className="table table-striped m-0">
          <thead className="table-light">
            <tr>
              <th>Mã PN</th>
              <th>Nhà cung cấp</th>
              <th>Ngày nhập</th>
              <th>Tổng tiền</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.idPhieuNhap}>
                  <td>{r.idPhieuNhap}</td>
                  <td>{r.tenNhaCungCap}</td>
                  <td>{new Date(r.ngayNhap).toLocaleDateString("vi-VN")}</td>
                  <td>{r.tongTien.toLocaleString("vi-VN")} đ</td>
                  <td>{r.ghiChu}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(r)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(r.idPhieuNhap)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Sửa phiếu nhập" : "Thêm phiếu nhập"}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nhà cung cấp</label>
                  <select
                    className="form-select"
                    name="idNcc"
                    value={form.idNcc}
                    onChange={onChange}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map(s => (
                      <option key={s.idNcc} value={s.idNcc}>
                        {s.tenNhaCungCap}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ngày nhập</label>
                  <input
                    type="date"
                    className="form-control"
                    name="ngayNhap"
                    value={form.ngayNhap}
                    onChange={onChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    name="ghiChu"
                    rows={3}
                    value={form.ghiChu}
                    onChange={onChange}
                  />
                </div>

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
                    {form.details.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <select
                          className="form-select"
                          value={d.idSanPham}
                          onChange={e => onDetailChange(i, "idSanPham", e.target.value)}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => (
                            <option key={p.idSanPham} value={p.idSanPham}>
                              {p.tenSanPham}
                            </option>
                          ))}
                        </select>

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
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-sm btn-outline-success" onClick={onAddDetail}>+ Thêm dòng</button>

                <div className="mt-3 text-end fw-bold">
                  Tổng tiền: {form.tongTien.toLocaleString("vi-VN")} đ
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
    </div>
  );
}
