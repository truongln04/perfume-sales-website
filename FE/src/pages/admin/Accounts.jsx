import { useState, useMemo, useEffect } from "react";
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
    vaiTro: "KHACHHANG",
  };
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAccount());
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

   useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://localhost:8081/accounts", {
          headers: getAuthHeader(),
        });
        if (res.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("Không thể tải danh sách tài khoản");
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        alert("Lỗi khi tải danh sách tài khoản: " + err.message);
      }
    };

    fetchAccounts();
    
    // Khi Header cập nhật tài khoản, cập nhật lại danh sách ngay
  const handleAccountUpdated = () => {
    fetchAccounts();
  };

  window.addEventListener("account-updated", handleAccountUpdated);

  return () => window.removeEventListener("account-updated", handleAccountUpdated);
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = !q
      ? accounts
      : accounts.filter(
          (a) =>
            a.tenHienThi?.toLowerCase().includes(q) ||
            a.email?.toLowerCase().includes(q)
        );
    return [...result].sort((a, b) => a.idTaiKhoan - b.idTaiKhoan);
  }, [accounts, search]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyAccount());
    setShowModal(true);
  };

  const onEdit = (acc) => {
    setEditing(acc);
    setForm({ ...acc, matKhau: "" });
    setShowModal(true);
  };

  const onDelete = async (idTaiKhoan) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      try {
        const res = await fetch(`http://localhost:8081/accounts/${idTaiKhoan}`, {
          method: "DELETE", headers: getAuthHeader(),
        });
        if (!res.ok) throw new Error("Không thể xóa tài khoản");
        setAccounts((prev) => prev.filter((a) => a.idTaiKhoan !== idTaiKhoan));
        alert("Đã xóa tài khoản thành công!");
      } catch (err) {
        alert("Lỗi khi xóa tài khoản: " + err.message);
      }
    }
  };

  const onSave = async () => {
    if (!form.tenHienThi.trim() || !form.email.trim()) {
      alert("Vui lòng nhập tên hiển thị và email");
      return;
    }

    try {
      let res;
      if (editing) {
        res = await fetch(`http://localhost:8081/accounts/${form.idTaiKhoan}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("http://localhost:8081/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) throw new Error("Không thể lưu tài khoản");
      const updated = await res.json();

      setAccounts((prev) =>
        editing
          ? prev.map((a) => (a.idTaiKhoan === updated.idTaiKhoan ? updated : a))
          : [...prev, updated]
      );

      setShowModal(false);
      setEditing(null);
      alert(editing ? "Cập nhật thành công!" : "Thêm mới thành công!");
    } catch (err) {
      alert("Lỗi khi lưu tài khoản: " + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card mt-4">
  <div className="card-header d-flex justify-content-between align-items-center">
    <h5 className="m-0 text-primary">👥 Quản lý tài khoản</h5>
    <div className="d-flex gap-2">
      <button className="btn btn-primary" onClick={onAdd}>
        ➕ Thêm tài khoản
      </button>
      <input
        className="form-control"
        placeholder="🔍 Tìm theo tên hoặc email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 260 }}
      />
    </div>
  </div>

  <div className="card-body p-0">
    <table className="table table-striped m-0 align-middle">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Ảnh đại diện</th>
          <th>Tên hiển thị</th>
          <th>Email</th>
          <th>Vai trò</th>
          <th>Số điện thoại</th>
          <th>Google ID</th>
          <th>Mật khẩu</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan="8" className="text-center py-4">
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
                    width={40}
                    height={40}
                    className="rounded-circle"
                  />
                ) : (
                  <span className="text-muted">N/A</span>
                )}
              </td>
              <td>{acc.tenHienThi}</td>
              <td>{acc.email}</td>
              <td>
                <span
                  className={`badge ${
                    acc.vaiTro === "ADMIN"
                      ? "bg-danger"
                      : acc.vaiTro === "NHANVIEN"
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {acc.vaiTro}
                </span>
              </td>
              <td>{acc.sdt || "N/A"}</td>
              <td>{acc.googleId || "N/A"}</td>
              <td>
              <span className="text-muted" style={{ fontFamily: "monospace" }}>
                {acc.matKhau ? acc.matKhau.slice(0, 10) + "..." : "N/A"}
              </span>
            </td>
              <td style={{ verticalAlign: "middle" }}>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onEdit(acc)}
                >
                  ✏️ Sửa
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(acc.idTaiKhoan)}
                >
                  🗑️ Xóa
                </button>
              </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* ✅ Modal thêm / sửa tài khoản */}
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
              {editing ? "✏️ Sửa tài khoản" : "➕ Thêm tài khoản"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowModal(false)}
            ></button>
          </div>

          <div className="modal-body">
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
                // Nếu vai trò hiện tại là ADMIN, KHACHHANG ⇒ KHÔNG được chỉnh sửa
                form.vaiTro === "ADMIN" || form.vaiTro === "KHACHHANG" ? (  
                <input
                  type="text"
                  className="form-control"
                  value={
                    form.vaiTro === "ADMIN" ? "Admin"
                  : form.vaiTro === "NHANVIEN" ? "Nhân viên"
                  : "Khách hàng"
                  }
                  readOnly
                />
                ) : (
                  // Nếu role là nhân viên ⇒ ĐƯỢC PHÉP CHỈNH SỬA
      <select
        name="vaiTro"
        className="form-select"
        value={form.vaiTro}
        onChange={handleChange}
      >
        <option value="ADMIN">Admin</option>
        <option value="NHANVIEN">Nhân viên</option>
      </select>
    )
      ) : (
        // Trạng thái thêm mới: luôn cho chọn vai trò
        <select
          name="vaiTro"
          className="form-select"
          value={form.vaiTro}
          onChange={handleChange}
        >
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
              <div className="col-md-6">
                <label className="form-label">Google ID</label>
                <input
                   type="text"
                   name="googleId"
                   className="form-control"
                   value={form.googleId || ""}
                  readOnly
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
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setForm((prev) => ({ ...prev, anhDaiDien: ev.target.result }));
                  };
                    reader.readAsDataURL(file);
                 }
               }}
                />
              </div>
                <div className="col-md-6">
  <label className="form-label">Mật khẩu</label>
  {editing ? (
    // Khi đang sửa
    (form.vaiTro === 'ADMIN' || form.vaiTro === 'NHANVIEN') ? (
      <input
        type="password"
        name="matKhau"
        className="form-control"
        value={form.matKhau}
        onChange={handleChange}
        placeholder="Nhập mật khẩu mới"
      />
    ) : (
      <input
        type="text"
        name="matKhau"
        className="form-control"
        value={form.matKhau}
        readOnly
      />
    )
  ) : (
    // Khi thêm mới
    <input
      type="password"
      name="matKhau"
      className="form-control"
      value={form.matKhau}
      onChange={handleChange}
      placeholder="Nhập mật khẩu"
    />
  )}
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