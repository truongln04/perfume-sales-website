import { useState, useEffect, useMemo } from "react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", description: "" });
  const [editing, setEditing] = useState(null);

  const API_URL = "http://localhost:8081/categories";
  const token = localStorage.getItem("token");

  // Load all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ gửi token
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search categories by name
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchCategories();
      return;
    }
    try {
     const res = await fetch(`${API_URL}/search?name=${encodeURIComponent(value)}`, {
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ gửi token
        },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const filtered = useMemo(() => {
    return [...categories].sort((a, b) => a.id - b.id);
  }, [categories]);

  const onAdd = () => {
    setEditing(null);
    setForm({ id: "", name: "", description: "" });
    setShowModal(true);
  };

  const onEdit = (category) => {
    setEditing(category);
    setForm({ ...category });
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (window.confirm("Xóa danh mục này?")) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ gửi token
          },
        });
        fetchCategories();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || "Chưa có mô tả",
    };

    try {
      if (editing) {
        await fetch(`${API_URL}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // ✅ gửi token
           },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // ✅ gửi token
           },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      setEditing(null);
      fetchCategories();
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
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="m-0">Danh mục sản phẩm</h5>
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
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(c)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c.id)}>Xóa</button>
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
                <div className="mb-3">
                  <label className="form-label">Tên danh mục</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <input
                    className="form-control"
                    name="description"
                    value={form.description}
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
