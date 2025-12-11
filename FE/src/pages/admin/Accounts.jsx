import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

function emptyAccount() {
  return {
    idTaiKhoan: "",
    tenHienThi: "",
    email: "",
    sdt: "",
    anhDaiDien: "",
    googleId: "",
    matKhau: "",
    vaiTro: "",
  };
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAccount());

  // Gộp lỗi + thông báo thành công
  const [listMessage, setListMessage] = useState({ text: "", type: "" });
  const [modalMessage, setModalMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();
  const API_URL = "http://localhost:8081/accounts";
  const token = localStorage.getItem("token");

  const showListMessage = (text, type = "success") => {
    setListMessage({ text, type });
    setTimeout(() => setListMessage({ text: "", type: "" }), 3000);
  };

  const showModalMessage = (text, type = "error") => {
    setModalMessage({ text, type });
    setTimeout(() => setModalMessage({ text: "", type: "" }), 3000);
  };


  useEffect(() => {
    fetchAccounts();

    const handleUpdate = () => fetchAccounts();
    window.addEventListener("account-updated", handleUpdate);
    return () => window.removeEventListener("account-updated", handleUpdate);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        showListMessage("Phiên đăng nhập đã hết hạn!", "error");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("Không thể tải danh sách tài khoản");

      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      showListMessage("Lỗi tải danh sách tài khoản", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return accounts
      .filter(
        (a) =>
          a.tenHienThi?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.idTaiKhoan - b.idTaiKhoan);
  }, [accounts, search]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyAccount());
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (acc) => {
    setEditing(acc);
    setForm({ ...acc, matKhau: "" });
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Xóa tài khoản này?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Không thể xóa tài khoản");
      }

      fetchAccounts();
      showListMessage("Xóa tài khoản thành công!");
    } catch (err) {
      showListMessage(err.message || "Lỗi khi xóa tài khoản", "error");
    }
  };

  // HOÀN HẢO NHƯ BRANDS.JSX – validate nhẹ + bắt lỗi backend
  const onSave = async () => {
    // 1. Validate nhanh ở frontend (UX mượt)
    if (!form.tenHienThi?.trim()) return showModalMessage("Vui lòng nhập tên hiển thị", "error");
    if (!form.email?.trim()) return showModalMessage("Vui lòng nhập email", "error");
    if (!editing && !form.sdt?.trim()) return showModalMessage("Vui lòng nhập số điện thoại", "error");
    if (!editing && !form.matKhau?.trim()) return showModalMessage("Vui lòng nhập mật khẩu", "error");

    const payload = {
      tenHienThi: form.tenHienThi.trim(),
      email: form.email.trim().toLowerCase(),
      sdt: form.sdt?.trim() || null,
      anhDaiDien: form.anhDaiDien?.trim() || null,
      matKhau: form.matKhau || undefined, // không gửi nếu để trống khi sửa
      vaiTro: form.vaiTro,
    };

    try {
      const res = await fetch(
        editing ? `${API_URL}/${form.idTaiKhoan}` : API_URL,
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
        throw new Error(data.message || "Lưu tài khoản thất bại");
      }

      setAccounts((prev) =>
        editing
          ? prev.map((a) => (a.idTaiKhoan === data.idTaiKhoan ? data : a))
          : [...prev, data]
      );

      setShowModal(false);
      showListMessage(
        editing ? "Cập nhật tài khoản thành công!" : "Thêm tài khoản thành công!"
      );
      window.dispatchEvent(new Event("account-updated"));
    } catch (err) {
      showModalMessage(err.message || "Lỗi khi lưu tài khoản", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message.text) setModalMessage({ text: "", type: "" });
  };

  return (
    <div className="card mt-0">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="m-0 text-primary fw-bold">Quản lý tài khoản</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={onAdd}>
            Thêm mới
          </button>
          <input
            className="form-control"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
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

      {/* Table */}
      <div className="card-body p-0">
        <table className="table table-hover table-striped align-middle m-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th style={{ width: 70 }}>Ảnh</th>
              <th>Tên hiển thị</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>SĐT</th>
              <th>Google ID</th>
              <th>Mật khẩu</th>
              <th style={{ width: 120 }}>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((acc) => (
                <tr key={acc.idTaiKhoan}>
                  <td>{acc.idTaiKhoan}</td>

                  <td>
                    {acc.anhDaiDien ? (
                      <img
                        src={acc.anhDaiDien}
                        alt="avatar"
                        width={38}
                        height={38}
                        className="rounded-circle border"
                      />
                    ) : (
                      <small className="text-muted">N/A</small>
                    )}
                  </td>

                  <td>{acc.tenHienThi}</td>
                  <td>{acc.email}</td>

                  <td>
                    <span
                      className={
                        "badge " +
                        (acc.vaiTro === "ADMIN"
                          ? "bg-danger"
                          : acc.vaiTro === "NHANVIEN"
                            ? "bg-primary"
                            : "bg-success")
                      }
                    >
                      {acc.vaiTro}
                    </span>
                  </td>


                  <td>{acc.sdt || "N/A"}</td>
                  <td>{acc.googleId || "N/A"}</td>

                  <td>
                    <small className="text-muted" style={{ fontFamily: "monospace" }}>
                      {acc.matKhau ? acc.matKhau.slice(0, 10) + "..." : "N/A"}
                    </small>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={acc.vaiTro === "KHACHHANG"}
                        onClick={() => acc.vaiTro !== "KHACHHANG" && onEdit(acc)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(acc.idTaiKhoan)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,.45)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              {/* Modal header */}
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editing ? "Sửa tài khoản" : "Thêm tài khoản"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              {/* Modal body */}
              <div className="modal-body">
                {modalMessage.type === "error" && modalMessage.text && (
                  <div className="alert alert-danger py-2">{modalMessage.text}</div>
                )}
                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label">Tên hiển thị</label>
                    <input
                      type="text"
                      name="tenHienThi"
                      className="form-control"
                      value={form.tenHienThi}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Vai trò</label>
                    {editing ? (
                      // Khi sửa: Admin hoặc Nhân viên đều KHÔNG được phép chỉnh vai trò
                      <input
                        type="text"
                        className="form-control"
                        value={
                          form.vaiTro === "ADMIN"
                            ? "Admin"
                            : form.vaiTro === "NHANVIEN"
                              ? "Nhân viên"
                              : "Khách hàng"
                        }
                        readOnly
                      />
                    ) : (
                      // Khi thêm mới: chỉ cho chọn Admin hoặc Nhân viên
                      <select
                        name="vaiTro"
                        className="form-select"
                        value={form.vaiTro || ""}
                        onChange={handleChange}
                      >
                        <option value="">-- Chọn vai trò --</option>
                        <option value="ADMIN">Admin</option>
                        <option value="NHANVIEN">Nhân viên</option>
                      </select>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      name="sdt"
                      className="form-control"
                      value={form.sdt}
                      onChange={handleChange}
                    />
                  </div>


                  <div className="col-md-12">
                    <label className="form-label">Ảnh đại diện (URL)</label>
                    <input
                      type="text"
                      name="anhDaiDien"
                      className="form-control"
                      value={form.anhDaiDien}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      name="matKhau"
                      className="form-control"
                      value={form.matKhau}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu"
                    />
                  </div>

                </div>
              </div>

              {/* Modal footer */}
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
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
