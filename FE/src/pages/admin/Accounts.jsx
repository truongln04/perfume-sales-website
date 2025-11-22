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
                      onClick={() => onEdit(acc)}
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
                  <select
                    name="vaiTro"
                    className="form-select"
                    value={form.vaiTro}
                    onChange={handleChange}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="NHANVIEN">Nhân viên</option>
                    <option value="KHACHHANG">Khách hàng</option>
                  </select>
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
