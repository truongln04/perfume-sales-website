import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedItems] = useState(state?.selectedItems || []);
  const [totalPrice] = useState(state?.totalPrice || 0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    hoTenNhan: "",
    sdtNhan: "",
    diaChiGiao: "",
    ghiChu: "",
    phuongThucTT: "COD",
  });

  // Thông báo lỗi / thành công giống Brands.jsx
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:8081";

  const safeBtoa = (obj) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))));

  // Kiểm tra giỏ hàng & đăng nhập
  useEffect(() => {
    if (!state || selectedItems.length === 0) {
      showMessage("Giỏ hàng trống! Vui lòng chọn sản phẩm.", "error");
      navigate("/client/cart");
      return;
    }

    if (!token) {
      showMessage("Vui lòng đăng nhập để thanh toán!", "error");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const hoTen = decoded.tenHienThi || decoded.sub || "";
      const sdt = decoded.sdt || decoded.phone || "";
      setForm((prev) => ({
        ...prev,
        hoTenNhan: hoTen,
        sdtNhan: sdt,
      }));
    } catch (err) {
      showMessage("Token không hợp lệ!", "error");
    }
  }, [state, selectedItems, navigate, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Xóa thông báo khi người dùng bắt đầu nhập lại
    if (message.text) setMessage({ text: "", type: "" });
  };

  // === VALIDATE FORM – ĐỒNG BỘ 100% VỚI OrdersService ===
  const validateForm = () => {
    const hoTen = form.hoTenNhan.trim();
    const sdt = form.sdtNhan.trim();
    const diaChi = form.diaChiGiao.trim();
    const ghiChu = form.ghiChu?.trim() || "";

    if (!hoTen) return showMessage("Vui lòng nhập họ tên người nhận", "error");
    if (!/^[a-zA-ZÀ-ỹ\s]{3,40}$/.test(hoTen))
      return showMessage("Họ tên từ 3-40 ký tự, chỉ chứa chữ cái và khoảng trắng", "error");

    if (!sdt) return showMessage("Vui lòng nhập số điện thoại người nhận", "error");
    if (!/^0[0-9]{9}$/.test(sdt))
      return showMessage("Số điện thoại phải bắt đầu bằng 0 và đúng 10 chữ số", "error");

    if (!diaChi) return showMessage("Vui lòng nhập địa chỉ giao hàng", "error");
    if (!/^[a-zA-ZÀ-ỹ0-9 ,./-]{3,40}$/.test(diaChi))
      return showMessage("Địa chỉ từ 3-40 ký tự, chỉ chứa chữ, số, khoảng trắng và dấu ,./-", "error");

    if (ghiChu && !/^[a-zA-ZÀ-ỹ0-9\s]{8,}$/.test(ghiChu))
      return showMessage("Ghi chú ít nhất 8 ký tự trở lên", "error");

    return true;
  };

  // =================== COD =======================
  const handleCODOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    let idTaiKhoan = null;
    try {
      const decoded = jwtDecode(token);
      idTaiKhoan = decoded.idTaiKhoan || decoded.id || decoded.userId;
    } catch (err) {
      setLoading(false);
      return showMessage("Token không hợp lệ!", "error");
    }

    const payload = {
      request: {
        idTaiKhoan,
        hoTenNhan: form.hoTenNhan.trim(),
        sdtNhan: form.sdtNhan.trim(),
        diaChiGiao: form.diaChiGiao.trim(),
        ghiChu: form.ghiChu.trim() || null,
        phuongThucTT: "COD",
      },
      chiTietDonHang: selectedItems.map((item) => ({
        idSanPham: item.idSanPham || item.id,
        soLuong: item.soLuong,
        donGia: item.donGia || item.giaBan,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Đặt hàng thất bại");
      }

      const result = await res.json();

      // Xóa giỏ hàng
      const deletePromises = selectedItems.map((item) =>
        fetch(`${API_URL}/cart/${item.idCtgh}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(deletePromises);
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: "refresh" }));

      alert(`Đặt hàng thành công! Mã đơn: #${result.id}`);
      navigate("/client/orderslist");
    } catch (err) {
      showMessage(err.message || "Lỗi đặt hàng COD", "error");
    } finally {
      setLoading(false);
    }
  };

  // =================== MOMO =======================
  const handleMomoPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const orderDataForMomo = {
      selectedItems,
      totalPrice,
      hoTenNhan: form.hoTenNhan.trim(),
      sdtNhan: form.sdtNhan.trim(),
      diaChiGiao: form.diaChiGiao.trim(),
      ghiChu: form.ghiChu.trim() || "",
      phuongThucTT: "ONLINE",
    };

    const momoRequest = {
      amount: totalPrice,
      orderInfo: `Thanh toán đơn hàng PerfumeShop - ${new Date().toLocaleString("vi-VN")}`,
      extraData: safeBtoa(orderDataForMomo),
    };

    try {
      const res = await fetch(`${API_URL}/payment/momo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(momoRequest),
      });

      const data = await res.json();

      if (data.payUrl) {
        localStorage.setItem("pendingMomoOrder", momoRequest.extraData);
        window.location.href = data.payUrl;
      } else {
        throw new Error(data.message || "Không nhận được link thanh toán");
      }
    } catch (err) {
      showMessage(err.message || "Lỗi kết nối MoMo", "error");
      setLoading(false);
    }
  };

  const handleConfirmOrder = () => {
    if (form.phuongThucTT === "COD") {
      handleCODOrder();
    } else {
      handleMomoPayment();
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
      {message.text && (
        <div className="col-12 mb-4">
          <div
            className={`alert ${
              message.type === "error" ? "alert-danger" : "alert-success"
            } alert-dismissible fade show text-center fw-medium`}
            role="alert"
            style={{ borderRadius: "12px" }}
          >
            {message.text}
            <button
              type="button"
              className="btn-close"
              onClick={() => setMessage({ text: "", type: "" })}
            ></button>
          </div>
        </div>
      )}
        {/* ========== BÊN TRÁI: THÔNG TIN GIAO HÀNG ========== */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Thông tin giao hàng</h4>
              
              <div className="mb-3">
                <label className="form-label">Họ và tên *</label>
                <input type="text" name="hoTenNhan" className="form-control"
                  value={form.hoTenNhan} onChange={handleInputChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Số điện thoại *</label>
                <input type="text" name="sdtNhan" className="form-control"
                  value={form.sdtNhan} onChange={handleInputChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Địa chỉ giao hàng *</label>
                <input type="text" name="diaChiGiao" className="form-control"
                  value={form.diaChiGiao} onChange={handleInputChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required />
              </div>

              <div className="mb-3">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea name="ghiChu" className="form-control" rows="3"
                  value={form.ghiChu} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        {/* ========== BÊN PHẢI: ĐƠN HÀNG + PHƯƠNG THỨC THANH TOÁN ========== */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <h4 className="fw-bold mb-4">Đơn hàng của bạn</h4>

              <table className="table table-borderless">
                <thead className="text-muted border-bottom">
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">Giá</th>
                    <th className="text-center">SL</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.idCtgh}>
                      <td className="fw-medium">{item.tenSanPham}</td>
                      <td className="text-center">{item.donGia.toLocaleString()}đ</td>
                      <td className="text-center">x{item.soLuong}</td>
                      <td className="text-end fw-bold">
                        {(item.donGia * item.soLuong).toLocaleString()}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tổng tiền */}
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <h5 className="fw-bold">Tổng cộng</h5>
                <h4 className="text-danger fw-bold">{totalPrice.toLocaleString()}đ</h4>
              </div>

              {/* ===== PHƯƠNG THỨC THANH TOÁN — ĐÃ CHUYỂN SANG BÊN PHẢI ===== */}
              <div className="mt-4 border-top pt-3">
                <h5 className="mb-3">Phương thức thanh toán</h5>

                <div className="form-check mb-3">
                  <input className="form-check-input" type="radio"
                    name="phuongThucTT" id="cod" value="COD"
                    checked={form.phuongThucTT === "COD"}
                    onChange={handleInputChange} />
                  <label className="form-check-label" htmlFor="cod">
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>

                <div className="form-check">
                  <input className="form-check-input" type="radio"
                    name="phuongThucTT" id="online" value="ONLINE"
                    checked={form.phuongThucTT === "ONLINE"}
                    onChange={handleInputChange} />
                  <label className="form-check-label d-flex align-items-center" htmlFor="online">
                    <img src="https://developers.momo.vn/v3/vi/img/logo.svg"
                      alt="MoMo" style={{ width: 40, marginRight: 10 }} />
                    <span>Thanh toán qua ví MoMo</span>
                  </label>
                </div>
              </div>

              {/* Nút xác nhận */}
              <button
                className="btn btn-warning btn-lg w-100 mt-4 fw-bold"
                style={{ borderRadius: "50px" }}
                onClick={handleConfirmOrder}
                disabled={loading}
              >
                {loading
                  ? "Đang xử lý..."
                  : form.phuongThucTT === "ONLINE"
                    ? "THANH TOÁN VỚI MOMO"
                    : "XÁC NHẬN ĐẶT HÀNG"}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
