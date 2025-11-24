import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Header({ collapsed }) {
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setFormData(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("Đăng xuất thành công!");
    setShowProfile(false);
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:8081/accounts/${formData.idTaiKhoan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Không thể cập nhật tài khoản");
      const updatedUser = await res.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("account-updated"));

      alert("Cập nhật thông tin thành công!");
      setEditMode(false);
    } catch (err) {
      alert("Lỗi khi lưu tài khoản: " + err.message);
    }
  };

  return (
    <header
      className="border-bottom bg-white"
      style={{
        position: "fixed",
        top: 0,
        left: collapsed ? 63 : 240, // khớp với sidebar linh hoạt
        right: 0,
        height: 63,
        zIndex: 1020,
        transition: "left 0.3s ease",
      }}
    >
      <div className="d-flex align-items-center justify-content-between px-3 py-2">
        <h5 className="m-0"></h5>
        <div style={{ cursor: "pointer" }} onClick={() => setShowProfile(true)}>
          <img
            src={formData.anhDaiDien}
            alt="avatar"
            className="rounded-circle"
            width={50}
            height={50}
          />
        </div>
      </div>

      {/* Modal hiển thị thông tin tài khoản */}
      {showProfile && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thông tin tài khoản</h5>
                <button type="button" className="btn-close" onClick={() => setShowProfile(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={formData.anhDaiDien}
                  alt="avatar"
                  className="rounded-circle mb-3"
                  width={100}
                  height={100}
                />
                {/* Bảng thông tin */}
                <table className="table table-bordered text-start">
                  <tbody>
                    <tr>
                      <th>Email</th>
                      <td>
                        <input type="text" className="form-control" readOnly value={formData.email || ""} />
                      </td>
                    </tr>
                    <tr>
                      <th>Vai trò</th>
                      <td>
                        <input type="text" className="form-control" readOnly value={formData.vaiTro || ""} />
                      </td>
                    </tr>
                    <tr>
                      <th>Tên hiển thị</th>
                      <td>
                        {editMode ? (
                          <input
                            className="form-control"
                            value={formData.tenHienThi || ""}
                            onChange={e => setFormData({ ...formData, tenHienThi: e.target.value })}
                          />
                        ) : (
                          <input type="text" className="form-control" readOnly value={formData.tenHienThi || "Chưa có"} />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Số điện thoại</th>
                      <td>
                        {editMode ? (
                          <input
                            className="form-control"
                            value={formData.sdt || ""}
                            onChange={e => setFormData({ ...formData, sdt: e.target.value })}
                          />
                        ) : (
                          <input type="text" className="form-control" readOnly value={formData.sdt || "Chưa cập nhật"} />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Ảnh đại diện</th>
                      <td>
                        {editMode ? (
                          <>
                            <input
                              className="form-control mb-2"
                              placeholder="Dán URL ảnh..."
                              value={formData.anhDaiDien || ""}
                              onChange={e => setFormData({ ...formData, anhDaiDien: e.target.value })}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control"
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setFormData({ ...formData, anhDaiDien: reader.result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </>
                        ) : (
                          <textarea
                            className="form-control"
                            readOnly
                            style={{
                              maxHeight: "4em",
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              wordBreak: "break-all",
                            }}
                            value={formData.anhDaiDien || ""}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <div>
                  {editMode ? (
                    <button className="btn btn-success me-2" onClick={handleSave}>Lưu</button>
                  ) : (
                    <button className="btn btn-outline-primary me-2" onClick={() => setEditMode(true)}>Chỉnh sửa</button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowProfile(false);
                      setEditMode(false);
                    }}
                  >
                    Đóng
                  </button>
                </div>
                <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
