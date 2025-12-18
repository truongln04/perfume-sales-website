import { useState, useMemo, useEffect } from "react";

function emptySupplier() {
  return {
    idNcc: "",
    tenNcc: "",
    diaChi: "",
    sdt: "",
    email: "",
    ghiChu: "",
  };
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySupplier());

  // Gộp lỗi + thông báo thành công – giống hệt Brands.jsx
  const [listMessage, setListMessage] = useState({ text: "", type: "" });
  const [modalMessage, setModalMessage] = useState({ text: "", type: "" });

  const API_URL = "http://localhost:8081/suppliers";
  const token = localStorage.getItem("token");

  const showListMessage = (text, type = "success") => {
    setListMessage({ text, type });
    setTimeout(() => setListMessage({ text: "", type: "" }), 3000);
  };

  const showModalMessage = (text, type = "error") => {
    setModalMessage({ text, type });
    setTimeout(() => setModalMessage({ text: "", type: "" }), 3000);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách");
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      showListMessage("Lỗi tải danh sách nhà cung cấp", "error");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchSuppliers();
      return;
    }
    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Tìm kiếm thất bại");
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      showListMessage("Lỗi tìm kiếm", "error");
    }
  };

  const filtered = useMemo(() => {
    return [...suppliers].sort((a, b) => a.idNcc - b.idNcc);
  }, [suppliers]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptySupplier());
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (supplier) => {
    setEditing(supplier);
    setForm({ ...supplier });
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onDelete = async (idNcc) => {
    if (!window.confirm("Xóa nhà cung cấp này?")) return;
    try {
      const res = await fetch(`${API_URL}/${idNcc}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Không thể xóa");
      }
      fetchSuppliers();
      showListMessage("Xóa nhà cung cấp thành công!");
    } catch (err) {
      showListMessage(err.message || "Lỗi khi xóa nhà cung cấp", "error");
    }
  };

  // GIỐNG HỆT BRANDS.JSX – CHUẨN HOÀN HẢO!
  const onSave = async () => {
    // 1. Validate nhanh ở frontend (UX tốt)
    if (!form.tenNcc?.trim()) return showModalMessage("Vui lòng nhập tên nhà cung cấp", "error");
    if (!form.diaChi?.trim()) return showModalMessage("Vui lòng nhập địa chỉ", "error");
    if (!form.sdt?.trim()) return showModalMessage("Vui lòng nhập số điện thoại", "error");
    if (!form.email?.trim()) return showModalMessage("Vui lòng nhập email", "error");
    if (!form.ghiChu?.trim()) return showModalMessage("Vui lòng nhập ghi chú", "error");

    const payload = {
      tenNcc: form.tenNcc.trim(),
      diaChi: form.diaChi.trim(),
      sdt: form.sdt.trim(),
      email: form.email.trim().toLowerCase(),
      ghiChu: form.ghiChu.trim(),
    };

    try {
      const res = await fetch(
        editing ? `${API_URL}/${editing.idNcc}` : API_URL,
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
        throw new Error(data.message || "Lưu nhà cung cấp thất bại");
      }

      // Thành công
      setSuppliers((prev) =>
        editing
          ? prev.map((s) => (s.idNcc === data.idNcc ? data : s))
          : [...prev, data]
      );

      setShowModal(false);
      showListMessage(
        editing ? "Cập nhật nhà cung cấp thành công!" : "Thêm nhà cung cấp thành công!"
      );
    } catch (err) {
      // Lỗi chi tiết từ backend
      showModalMessage(err.message || "Lỗi khi lưu nhà cung cấp", "error");
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
        <h5 className="m-0 text-primary fw-bold">Quản lý nhà cung cấp</h5>
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
                <tr key={s.idNcc}>
                  <td>{s.idNcc}</td>
                  <td>{s.tenNcc}</td>
                  <td>{s.diaChi}</td>
                  <td>{s.sdt}</td>
                  <td>{s.email}</td>
                  <td>{s.ghiChu}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEdit(s)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(s.idNcc)}
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
                {modalMessage.type === "error" && modalMessage.text && (
                  <div className="alert alert-danger py-2">{modalMessage.text}</div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên nhà cung cấp</label>
                    <input
                      className="form-control"
                      name="tenNcc"
                      value={form.tenNcc}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      className="form-control"
                      name="sdt"
                      value={form.sdt}
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
                      name="diaChi"
                      value={form.diaChi}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      name="ghiChu"
                      rows={3}
                      value={form.ghiChu}
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