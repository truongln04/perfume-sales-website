import { useState, useMemo, useEffect } from "react";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ idthuonghieu: "", tenthuonghieu: "", quocgia: "", logo: "" });

  const API_URL = "http://localhost:8081/brands";
  const token = localStorage.getItem("token");

  // Load all brands
  const fetchBrands = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },});
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Search brands by name
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchBrands();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const filtered = useMemo(() => {
    return [...brands].sort((a, b) => a.id - b.id);
  }, [brands]);

  const onAdd = () => {
    setEditing(null);
    setForm({ idthuonghieu: "", tenthuonghieu: "", quocgia: "", logo: "" });
    setShowModal(true);
  };

  const onEdit = (brand) => {
    setEditing(brand);
    setForm({ ...brand });
    setShowModal(true);
  };

  const onDelete = async (idthuonghieu) => {
    if (window.confirm("Xóa thương hiệu này?")) {
      try {
        await fetch(`${API_URL}/${idthuonghieu}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, });
        fetchBrands();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const onSave = async () => {
    if (!form.tenthuonghieu.trim()) {
      alert("Vui lòng nhập tên thương hiệu");
      return;
    }

    const payload = {
      tenthuonghieu: form.tenthuonghieu.trim(),
      quocgia: form.quocgia.trim(),
      logo: form.logo.trim(),
    };

    try {
      if (editing) {
        await fetch(`${API_URL}/${editing.idthuonghieu}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      setEditing(null);
      fetchBrands();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
            onChange={e => handleSearch(e.target.value)}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.idthuonghieu}>
                  <td>{b.idthuonghieu}</td>
                  <td>{b.tenthuonghieu}</td>
                  <td>{b.quocgia}</td>
                  <td>
                    {b.logo ? (
                      <img src={b.logo} alt={b.tenthuonghieu} width={60} height={40} style={{ objectFit: "contain" }} />
                    ) : (
                      <span className="text-muted">Không có</span>
                    )}
                  </td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(b)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(b.idthuonghieu)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa */}
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
                  <input className="form-control" name="tenthuonghieu" value={form.tenthuonghieu} placeholder="Nhập tên thương hiệu" onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quốc gia</label>
                  <input className="form-control" name="quocgia" value={form.quocgia} placeholder="Nhập tên quốc gia" onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Logo</label>
                  <input className="form-control" name="logo" value={form.logo} placeholder="Nhập URL Logo" onChange={handleChange} />
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