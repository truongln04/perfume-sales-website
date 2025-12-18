import { useState, useMemo, useEffect } from "react";

function emptyBrand() {
  return {
    idthuonghieu: "",
    tenthuonghieu: "",
    quocgia: "",
    logo: "",
  };
}

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBrand());

  // Gộp lỗi + thông báo thành công 
  const [listMessage, setListMessage] = useState({ text: "", type: "" });
  const [modalMessage, setModalMessage] = useState({ text: "", type: "" });

  const API_URL = "http://localhost:8081/brands";
  const token = localStorage.getItem("token");

  const showListMessage = (text, type = "success") => {
    setListMessage({ text, type });
    setTimeout(() => setListMessage({ text: "", type: "" }), 3000);
  };

  const showModalMessage = (text, type = "error") => {
    setModalMessage({ text, type });
    setTimeout(() => setModalMessage({ text: "", type: "" }), 3000);
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách");
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      showListMessage("Lỗi tải danh sách thương hiệu", "error");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchBrands();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Tìm kiếm thất bại");
      const data = await res.json();
      setBrands(data);
    } catch (err) {
      showListMessage("Lỗi tìm kiếm", "error");
    }
  };

  const filtered = useMemo(() => {
    return [...brands].sort((a, b) => a.idthuonghieu - b.idthuonghieu);
  }, [brands]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyBrand());
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (brand) => {
    setEditing(brand);
    setForm({ ...brand });
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onDelete = async (idthuonghieu) => {
    if (!window.confirm("Xóa thương hiệu này?")) return;
    try {
      const res = await fetch(`${API_URL}/${idthuonghieu}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Không thể xóa");
      }
      fetchBrands();
      showListMessage("Xóa thương hiệu thành công!");
    } catch (err) {
      showListMessage(err.message || "Lỗi khi xóa thương hiệu", "error");
    }
  };

  
  const onSave = async () => {
    // 1. Validate nhanh ở frontend (UX tốt)
    if (!form.tenthuonghieu.trim()) return showModalMessage("Vui lòng nhập tên thương hiệu", "error");
    if (!form.quocgia.trim()) return showModalMessage("Vui lòng nhập quốc gia", "error");
    if (!editing && !form.logo.trim()) return showModalMessage("Vui lòng nhập logo thương hiệu", "error");

    const payload = {
      tenthuonghieu: form.tenthuonghieu.trim(),
      quocgia: form.quocgia.trim(),
      logo: form.logo.trim(),
    };

    try {
      const res = await fetch(
        editing ? `${API_URL}/${editing.idthuonghieu}` : API_URL,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lưu thương hiệu thất bại");
      }

      // Thành công
      setBrands((prev) =>
        editing
          ? prev.map((b) => (b.idthuonghieu === data.idthuonghieu ? data : b))
          : [...prev, data]
      );

      setShowModal(false);
      showListMessage(
        editing ? "Cập nhật thương hiệu thành công!" : "Thêm thương hiệu thành công!"
      );
    } catch (err) {
      // Lỗi chi tiết từ backend
      showModalMessage(err.message || "Lỗi khi lưu thương hiệu", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message.text) setModalMessage({ text: "", type: "" });
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
       <h5 className="m-0 text-primary fw-bold">Quản lý thương hiệu</h5>
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
      {listMessage.type === "error" && listMessage.text && (
        <div className="alert alert-danger py-2">{listMessage.text}</div>
      )}
      {listMessage.type === "success" && listMessage.text && (
        <div className="m-3 py-2 px-3 rounded bg-success text-white">
          {listMessage.text}
        </div>
      )}

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
                 {modalMessage.type === "error" && modalMessage.text && (
                  <div className="alert alert-danger py-2">{modalMessage.text}</div>
                )}
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