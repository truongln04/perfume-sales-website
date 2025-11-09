import { useState, useEffect, useMemo } from "react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySupplier());
  const [message, setMessage] = useState({ text: "", type: "" }); // ✅ Gộp lỗi & thông báo

  const API_URL = "http://localhost:8081/suppliers";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Gửi token
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      const mapped = data.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        email: s.email,
        note: s.note,
      }));
      setSuppliers(mapped);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
      setMessage({ text: "❌ Không thể tải danh sách nhà cung cấp", type: "error" });
    }
  };

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchSuppliers();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const filtered = useMemo(() => {
    return [...suppliers].sort((a, b) => a.id - b.id);
  }, [suppliers]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptySupplier());
    setShowModal(true);
  };

  const onEdit = (s) => {
    setEditing(s);
    setForm({ ...s });
    setShowModal(true);
  };

  // ✅ Xóa nhà cung cấp (có thông báo backend)
  const onDelete = async (id) => {
    if (window.confirm("Xóa nhà cung cấp này?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: {
          "Authorization": `Bearer ${token}`, // ✅ Gửi token
        }, });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Lỗi khi xóa nhà cung cấp");
        }

        fetchSuppliers();
        setMessage({ text: "✅ Xóa nhà cung cấp thành công!", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      } catch (err) {
        setMessage({ text: "❌ " + err.message, type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 2000);
      }
    }
  };

  // ✅ Lưu (thêm/sửa)
  const onSave = async () => {
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email,
      note: form.note.trim(),
    };

    try {
      const res = await fetch(editing ? `${API_URL}/${form.id}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json",  "Authorization": `Bearer ${token}`, },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Lỗi khi lưu dữ liệu");
      }

      setShowModal(false);
      setEditing(null);
      fetchSuppliers();

      setMessage({
        text: editing
          ? "✅ Cập nhật nhà cung cấp thành công!"
          : "✅ Thêm nhà cung cấp thành công!",
        type: "success",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    } catch (err) {
      setMessage({ text: "❌ " + err.message, type: "error" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage({ text: "", type: "" }); // Xóa thông báo khi người dùng nhập lại
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0">Quản lý Nhà cung cấp</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={onAdd}>
            Thêm mới
          </button>
          <input
            className="form-control"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 260 }}
          />
        </div>
      </div>

      {/* ✅ Chỉ hiển thị thông báo thành công */}
      {message.type === "success" && message.text && (
        <div className="m-3 py-2 px-3 rounded bg-success text-white">
          {message.text}
        </div>
      )}


      <div className="card-body p-0">
        <table className="table table-striped m-0">
          <thead className="table-light">
            <tr>
              <th>Mã NCC</th>
              <th>Tên NCC</th>
              <th>Địa chỉ</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.address}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>{s.note}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEdit(s)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(s.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal thêm/sửa */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {message.type === "error" && message.text && (
                  <div className="alert alert-danger py-2">{message.text}</div>
                )}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên nhà cung cấp</label>
                    <input
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ</label>
                    <input
                      className="form-control"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      name="note"
                      rows={3}
                      value={form.note}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
                <button className="btn btn-primary" onClick={onSave}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function emptySupplier() {
  return {
    id: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    note: "",
  };
}