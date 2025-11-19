export default function BrandManager({
  brands,
  search,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  showModal,
  setShowModal,
  form,
  onChange,
  onSave,
  editing
}) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0">Quản lý Thương hiệu</h5>
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
              <th>ID</th>
              <th>Tên thương hiệu</th>
              <th>Quốc gia</th>
              <th>Logo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Không có dữ liệu</td>
              </tr>
            ) : (
              brands.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>{b.country}</td>
                  <td>
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} width={60} height={40} style={{ objectFit: "contain" }} />
                    ) : (
                      <span className="text-muted">Không có</span>
                    )}
                  </td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(b)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(b.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên thương hiệu</label>
                  <input className="form-control" name="name" value={form.name} onChange={onChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quốc gia</label>
                  <input className="form-control" name="country" value={form.country} onChange={onChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Logo (URL)</label>
                  <input className="form-control" name="logo" value={form.logo} onChange={onChange} />
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
