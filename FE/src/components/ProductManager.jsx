export default function ProductManager({
  products,
  search,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  showModal,
  setShowModal,
  form,
  setForm,
  onSave,
  editing,
  handleChange
}) {
  return (
    <div className="card">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="m-0">Quản lý sản phẩm</h5>
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
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped m-0">
            <thead className="table-light">
              <tr>
                <th>Mã SP</th>
                <th>Mã DM</th>
                <th>Mã TH</th>
                <th>Tên SP</th>
                <th>Hình ảnh</th>
                <th>Giá bán</th>
                <th>KM%</th>
                <th>Giá sau KM</th>
                <th>Số lượng tồn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4">Không có dữ liệu</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.idSanPham}>
                    <td>{p.idSanPham}</td>
                    <td>{p.idDanhMuc}</td>
                    <td>{p.idThuongHieu}</td>
                    <td>{p.tenSanPham}</td>
                    <td><img src={`/images/${p.hinhAnh}`} alt={p.tenSanPham} width={60} height={60} className="rounded" /></td>
                    <td>{p.giaBan.toLocaleString("vi-VN")} đ</td>
                    <td>{p.kmPhanTram}%</td>
                    <td>{(p.giaBan * (1 - p.kmPhanTram / 100)).toLocaleString("vi-VN")} đ</td>
                    <td>{p.soLuongTon}</td>
                    <td>
                      <span className={"badge " + (p.trangThai ? "bg-success" : "bg-secondary")}>
                        {p.trangThai ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(p)}>Sửa</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p.idSanPham)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Các input như đã dùng trong Products.jsx */}
                  <div className="col-md-3">
                    <label className="form-label">Mã DM</label>
                    <input className="form-control" name="idDanhMuc" value={form.idDanhMuc} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Mã TH</label>
                    <input className="form-control" name="idThuongHieu" value={form.idThuongHieu} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tên SP</label>
                    <input className="form-control" name="tenSanPham" value={form.tenSanPham} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mô tả</label>
                    <input className="form-control" name="moTa" value={form.moTa} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Hình ảnh</label>
                    <input className="form-control" name="hinhAnh" value={form.hinhAnh} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Giá nhập</label>
                    <input type="number" className="form-control" name="giaNhap" value={form.giaNhap} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Giá bán</label>
                    <input type="number" className="form-control" name="giaBan" value={form.giaBan} onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">KM%</label>
                    <input type="number" className="form-control" name="kmPhanTram" value={form.kmPhanTram} onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Giá sau KM</label>
                    <input
                      className="form-control"
                      value={(form.giaBan * (1 - form.kmPhanTram / 100)).toLocaleString("vi-VN") + " đ"}
                      disabled
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Tồn kho</label>
                    <input type="number" className="form-control" name="soLuongTon" value={form.soLuongTon} onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      name="trangThai"
                      value={form.trangThai ? "Đang bán" : "Ngừng bán"}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          trangThai: e.target.value === "Đang bán",
                        }))
                      }
                    >
                      <option value="Đang bán">Đang bán</option>
                      <option value="Ngừng bán">Ngừng bán</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                <button className="btn btn-primary" onClick={onSave}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
