import { useState, useMemo, useEffect } from "react";

function emptyCategory() {
  return {
    idDanhMuc: "",
    tenDanhMuc: "",
    moTa: "",
  };
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory());

  // Gộp lỗi + thông báo thành công 
 const [listMessage, setListMessage] = useState({ text: "", type: "" });
  const [modalMessage, setModalMessage] = useState({ text: "", type: "" });


  const API_URL = "http://localhost:8081/categories";
  const token = localStorage.getItem("token");

  const showListMessage = (text, type = "success") => {
    setListMessage({ text, type });
    setTimeout(() => setListMessage({ text: "", type: "" }), 3000);
  };

  const showModalMessage = (text, type = "error") => {
    setModalMessage({ text, type });
    setTimeout(() => setModalMessage({ text: "", type: "" }), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      showListMessage("Lỗi tải danh sách danh mục", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchCategories();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Tìm kiếm thất bại");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      showListMessage("Lỗi tìm kiếm", "error");
    }
  };

  const filtered = useMemo(() => {
    return [...categories].sort((a, b) => a.idDanhMuc - b.idDanhMuc);
  }, [categories]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyCategory());
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (category) => {
    setEditing(category);
    setForm({ ...category });
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onDelete = async (idDanhMuc) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      const res = await fetch(`${API_URL}/${idDanhMuc}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
      const message =
        errData.message || errData.error || "Không thể xóa danh mục";
      throw new Error(message);
      }
      fetchCategories();
      showListMessage("Xóa danh mục thành công!", "success");
    } catch (err) {
      console.error("Delete category error:", err);
    showListMessage(err.message || "Lỗi khi xóa danh mục", "error");
    }
  };


  const onSave = async () => {
    // 1. Validate nhanh ở frontend (UX tốt)
    if (!form.tenDanhMuc.trim()) return showModalMessage("Vui lòng nhập tên danh mục", "error");
    if (!form.moTa.trim()) return showModalMessage("Vui lòng nhập mô tả", "error");

    const payload = {
      tenDanhMuc: form.tenDanhMuc.trim(),
      moTa: form.moTa.trim(),
    };

    try {
      const res = await fetch(
        editing ? `${API_URL}/${editing.idDanhMuc}` : API_URL,
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
        throw new Error(data.message || "Lưu danh mục thất bại");
      }

      // Thành công
      setCategories((prev) =>
        editing
          ? prev.map((c) => (c.idDanhMuc === data.idDanhMuc ? data : c))
          : [...prev, data]
      );

      setShowModal(false);
      showListMessage(
        editing ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!"
      );
    } catch (err) {
      // Lỗi chi tiết từ backend
      showModalMessage(err.message || "Lỗi khi lưu danh mục", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message.text) setModalMessage({ text: "", type: "" });
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="m-0 text-primary fw-bold">Quản lý danh mục</h5>
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
        <table className="table table-hover table-striped m-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.idDanhMuc}>
                  <td>{c.idDanhMuc}</td>
                  <td>{c.tenDanhMuc}</td>
                  <td>{c.moTa}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(c)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c.idDanhMuc)}>Xóa</button>
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
                <h5 className="modal-title">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
               {modalMessage.type === "error" && modalMessage.text && (
                  <div className="alert alert-danger py-2">{modalMessage.text}</div>
                )}
                <div className="mb-3">
                  <label className="form-label">Tên danh mục</label>
                  <input
                    className="form-control"
                    name="tenDanhMuc"
                    value={form.tenDanhMuc}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <input
                    className="form-control"
                    name="moTa"
                    value={form.moTa}
                    onChange={handleChange}
                  />
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