
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
  handleChange,
  danhMucs,
  thuongHieus,
  nhaCungCaps,
  listMessage,
  modalMessage,
}) {


  return (
    <div className="card">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="m-0 text-primary fw-bold">Quản lý sản phẩm</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={onAdd}>Thêm mới</button>
            <input
              className="form-control"
              placeholder="Tìm kiếm tên sản phẩm"
              value={search}
              onChange={e => onSearch(e.target.value)}
              style={{ width: 260 }}
            />
          </div>
        </div>
      </div>
      {listMessage.type === "error" && listMessage.text && (
        <div className="alert alert-danger py-2">{listMessage.text}</div>
      )}
      {listMessage.type === "success" && listMessage.text && (
        <div className="m-3 py-2 px-3 rounded bg-success text-white">
          {listMessage.text}
        </div>
      )}

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped m-0">
            <thead className="table-light">
              <tr>
                <th>Mã SP</th>
                <th>Mã DM</th>
                <th>Mã TH</th>
                <th>Mã NCC</th>
                <th>Tên SP</th>
                <th>Hình ảnh</th>
                <th>Mô tả</th>
                <th>Giá nhập</th>
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
                  <td colSpan="13" className="text-center py-4">Không có dữ liệu</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.idSanPham}>
                    <td>{p.idSanPham}</td>
                    <td>{p.idDanhMuc}</td>
                    <td>{p.idthuonghieu}</td>
                    <td>{p.idNcc}</td>
                    <td>{p.tenSanPham}</td>
                    <td>
                      <img
                        src={
                          p.hinhAnh?.startsWith("data:image") // ảnh từ máy (base64)
                            ? p.hinhAnh
                            : p.hinhAnh?.startsWith("http")   // ảnh từ URL
                              ? p.hinhAnh
                              : p.hinhAnh                       // ảnh từ thư mục /images/
                                ? `/images/${p.hinhAnh}`
                                : "/images/default.jpg"          // ảnh mặc định
                        }
                        alt={p.tenSanPham}
                        width={60}
                        height={60}
                        className="rounded"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = "/images/default.jpg";
                        }}
                      />
                    </td>

                    <td style={{ maxWidth: 200 }}>
                      {p.moTa.length > 60 ? (
                        <span title={p.moTa}>
                          {p.moTa.slice(0, 60)}... <span className="text-primary" style={{ cursor: "pointer" }}>Xem thêm</span>
                        </span>
                      ) : (
                        p.moTa
                      )}
                    </td>
                    <td>{p.giaNhap != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.giaNhap) : "—"}</td>
                    <td>{p.giaBan != null ? p.giaBan.toLocaleString("vi-VN") + " đ" : "—"}</td>
                    <td>{p.kmPhanTram != null ? p.kmPhanTram + "%" : "—"}</td>
                    <td>
                      {p.giaBan != null && p.kmPhanTram != null
                        ? (p.giaBan * (1 - p.kmPhanTram / 100)).toLocaleString("vi-VN") + " đ"
                        : "—"}
                    </td>

                    <td>{p.soLuongTon}</td>
                    <td>
                      <span className={"badge " + (p.trangThai ? "bg-success" : "bg-secondary")}>
                        {p.trangThai ? "Đang bán" : "Chưa bán"}
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
                {modalMessage.type === "error" && modalMessage.text && (
                  <div className="alert alert-danger py-2">{modalMessage.text}</div>
                )}
                <div className="row g-3">
                  {/* Danh mục */}
                  <div className="col-md-6">
                    <label className="form-label">Danh Mục</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={form.idDanhMuc + " - " + form.tenDanhMuc || ""}
                        disabled
                      />
                    ) : (
                      <select
                        className="form-select"
                        name="idDanhMuc"
                        value={form.idDanhMuc}
                        onChange={handleChange}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {danhMucs.map(dm => (
                          <option key={dm.idDanhMuc} value={dm.idDanhMuc}>
                            {dm.idDanhMuc} - {dm.tenDanhMuc}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Thương hiệu */}
                  <div className="col-md-6">
                    <label className="form-label">Thương Hiệu</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={form.idthuonghieu + " - " + form.tenthuonghieu || ""}
                        disabled
                      />
                    ) : (
                      <select
                        className="form-select"
                        name="idthuonghieu"
                        value={form.idthuonghieu}
                        onChange={handleChange}
                      >
                        <option value="">-- Chọn thương hiệu --</option>
                        {thuongHieus.map(th => (
                          <option key={th.idthuonghieu} value={th.idthuonghieu}>
                            {th.idthuonghieu} - {th.tenthuonghieu}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Nhà cung cấp */}
                  <div className="col-md-6">
                    <label className="form-label">Nhà Cung Cấp</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={form.idNcc + " - " + form.tenNcc || ""}
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
                        {nhaCungCaps.map(ncc => (
                          <option key={ncc.idNcc} value={ncc.idNcc}>
                            {ncc.idNcc} - {ncc.tenNcc}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Tên & mô tả */}
                  <div className="col-md-6">
                    <label className="form-label">Tên SP</label>
                    <input className="form-control" name="tenSanPham" value={form.tenSanPham} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      name="moTa"
                      value={form.moTa}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  {/* Hình ảnh */}
                  <div className="col-md-6">
                    <label className="form-label">Hình ảnh</label>

                    {/* Nhập đường dẫn ảnh */}
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Nhập đường dẫn ảnh (nếu có)"
                      name="hinhAnh"
                      value={form.hinhAnh}
                      onChange={e => {
                        handleChange(e);
                        setForm(prev => ({
                          ...prev,
                          previewImage: "" // reset preview nếu người dùng nhập link mới
                        }));
                      }}
                    />

                    {/* Chọn ảnh từ máy */}
                    <input
                      type="file"
                      className="form-control mb-2"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setForm(prev => ({
                              ...prev,
                              hinhAnh: reader.result,       // ✅ gán base64 vào ô input
                              previewImage: reader.result   // ✅ dùng để hiển thị ảnh
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {/* Hiển thị ảnh */}
                    <img
                      src={
                        form.previewImage ||
                        (form.hinhAnh?.trim() ? form.hinhAnh : "/images/default.jpg")
                      }
                      alt="Preview"
                      className="rounded border mt-2"
                      style={{ width: 120, height: 120, objectFit: "cover" }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = "/images/default.jpg";
                      }}
                    />
                  </div>


                  {/* Giá cả & khuyến mãi */}
                  <div className="col-md-3">
                    <label className="form-label">Giá nhập</label>
                    <input
                      type="text"
                      className="form-control"
                      value={new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(form.giaNhap)}
                      disabled
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Giá bán</label>
                    {/* Ô nhập số thô */}
                    <input
                      type="number"
                      className="form-control"
                      name="giaBan"
                      value={form.giaBan}
                      onChange={handleChange}
                    />
                    {/* Hiển thị giá đã format
                    <small className="text-muted">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(form.giaBan || 0)}
                    </small> */}
                  </div>


                  <div className="col-md-3">
                    <label className="form-label">KM%</label>
                    <input
                      type="number"
                      className="form-control"
                      name="kmPhanTram"
                      value={form.kmPhanTram}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Giá sau KM</label>
                    <input
                      className="form-control"
                      value={new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(form.giaBan * (1 - form.kmPhanTram / 100))}
                      disabled
                    />
                  </div>


                  {/* Tồn kho & trạng thái */}
                  <div className="col-md-3">
                    <label className="form-label">Tồn kho</label>
                    <input type="number" className="form-control" name="soLuongTon" value={form.soLuongTon} onChange={handleChange} disabled />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      name="trangThai"
                      value={form.trangThai ? "Đang bán" : "Chưa bán"}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === "Đang bán" && (!form.giaBan || form.giaBan <= 0)) {
                          alert("Vui lòng nhập giá bán trước khi chuyển sang trạng thái Đang bán!");
                          return; // ❌ không cho đổi trạng thái
                        }
                        setForm(prev => ({
                          ...prev,
                          trangThai: value === "Đang bán",
                        }));
                      }}
                    >
                      <option value="Đang bán">Đang bán</option>
                      <option value="Chưa bán">Chưa bán</option>
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

