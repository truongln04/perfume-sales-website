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
    phuongThucTT: "COD", // COD hoặc ONLINE (MoMo)
  });

  // Hàm mã hóa Base64 an toàn với tiếng Việt - PHIÊN BẢN MỚI NHẤT 2025 (không deprecated)
  const safeBtoa = (obj) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))));

  useEffect(() => {
    if (!state || selectedItems.length === 0) {
      alert("Giỏ hàng trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
      navigate("/client/cart");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const hoTen = decoded.tenHienThi || decoded.sub || "";
      const sdt = decoded.sdt || decoded.phone || "";
      setForm(prev => ({
        ...prev,
        hoTenNhan: hoTen,
        sdtNhan: sdt,
      }));
    } catch (err) {
      console.error("Token lỗi:", err);
    }
  }, [state, selectedItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // XỬ LÝ ĐẶT HÀNG COD
  const handleCODOrder = async () => {
    if (!form.hoTenNhan.trim() || !form.sdtNhan.trim() || !form.diaChiGiao.trim()) {
      alert("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    let idTaiKhoan = null;
    try {
      const decoded = jwtDecode(token);
      
      idTaiKhoan = decoded.idTaiKhoan || decoded.id || decoded.userId || null;
    } catch (err) {
      console.error("Token lỗi:", err);
    }

    const payload = {
      request: {
        idTaiKhoan,
        hoTenNhan: form.hoTenNhan.trim(),
        sdtNhan: form.sdtNhan.trim(),
        diaChiGiao: form.diaChiGiao.trim(),
        ghiChu: form.ghiChu.trim() || null,
        phuongThucTT: "COD"
      },
      chiTietDonHang: selectedItems.map(item => ({
        idSanPham: item.idSanPham || item.id,
        soLuong: item.soLuong,
        donGia: item.donGia
      }))
    };
    console.log("Payload gửi lên backend (COD):", payload);
    console.log("idTaiKhoan đang gửi:", idTaiKhoan);

    try {
      const res = await fetch("http://localhost:8081/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        await fetch(`http://localhost:8081/cart/clear/${idTaiKhoan}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: 0 }));
        alert(`Đặt hàng thành công! Mã đơn hàng: #${result.id}`);
        navigate("/client");
      } else {
        const error = await res.text();
        alert("Đặt hàng thất bại: " + error);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // XỬ LÝ THANH TOÁN MOMO
  const handleMomoPayment = async () => {
    if (!form.hoTenNhan.trim() || !form.sdtNhan.trim() || !form.diaChiGiao.trim()) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng trước khi thanh toán MoMo!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const orderDataForMomo = {
      selectedItems,
      totalPrice,
      hoTenNhan: form.hoTenNhan.trim(),
      sdtNhan: form.sdtNhan.trim(),
      diaChiGiao: form.diaChiGiao.trim(),
      ghiChu: form.ghiChu.trim() || "",
      phuongThucTT: "ONLINE"
    };

    const momoRequest = {
      amount: totalPrice,
      orderInfo: `Thanh toán đơn hàng PerfumeShop - ${new Date().toLocaleString("vi-VN")}`,
      extraData: safeBtoa(orderDataForMomo) // ĐÃ DÙNG HÀM MỚI - AN TOÀN 100%
    };

    try {
      const res = await fetch("http://localhost:8081/payment/momo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(momoRequest)
      });

      const data = await res.json();

      if (data.payUrl) {
        // Lưu tạm để xử lý khi quay lại từ MoMo
        localStorage.setItem("pendingMomoOrder", momoRequest.extraData);
        window.location.href = data.payUrl;
      } else {
        alert("Lỗi tạo thanh toán MoMo: " + (data.message || "Không nhận được payUrl"));
      }
    } catch (err) {
      console.error(err);
      alert("Không kết nối được đến cổng thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = () => {
    if (form.phuongThucTT === "COD") {
      handleCODOrder();
    } else if (form.phuongThucTT === "ONLINE") {
      handleMomoPayment();
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Bên trái - Thông tin giao hàng */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Thông tin giao hàng</h4>
              <div className="mb-3">
                <label className="form-label">Họ và tên người nhận *</label>
                <input type="text" name="hoTenNhan" className="form-control" value={form.hoTenNhan} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Số điện thoại *</label>
                <input type="text" name="sdtNhan" className="form-control" value={form.sdtNhan} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Địa chỉ giao hàng *</label>
                <input
                  type="text"
                  name="diaChiGiao"
                  className="form-control"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  value={form.diaChiGiao}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea name="ghiChu" className="form-control" rows="3" value={form.ghiChu} onChange={handleInputChange} />
              </div>

              <div className="mt-4">
                <h5 className="mb-3">Phương thức thanh toán</h5>
                
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="phuongThucTT"
                    id="cod"
                    value="COD"
                    checked={form.phuongThucTT === "COD"}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label d-flex align-items-center" htmlFor="cod">
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="phuongThucTT"
                    id="online"
                    value="ONLINE"
                    checked={form.phuongThucTT === "ONLINE"}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label d-flex align-items-center" htmlFor="online">
                    <img src="https://developers.momo.vn/v3/vi/img/logo.svg" alt="MoMo" style={{ width: 40, marginRight: 10 }} />
                    <span>Thanh toán qua ví MoMo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bên phải - Đơn hàng */}
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
                    <tr key={item.idGh}>
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

              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <h5 className="fw-bold">Tổng cộng</h5>
                <h4 className="text-danger fw-bold">{totalPrice.toLocaleString()}đ</h4>
              </div>

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
                    : "XÁC NHẬN ĐẶT HÀNG"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}