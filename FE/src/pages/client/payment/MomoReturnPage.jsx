import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function MomoReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Đang kiểm tra kết quả thanh toán...");
  const hasProcessed = useRef(false); // ← CHỐNG CHẠY 2 LẦN

  // === HÀM GIẢI MÃ MỚI - BẮT BUỘC PHẢI CÓ ĐỂ TƯƠNG THÍCH VỚI CHECKOUT.JSX ===
  const safeAtob = (str) =>
    JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0))));

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const handleMomoReturn = async () => {
      const resultCode = searchParams.get("resultCode"); // 0 = thành công
      const orderId = searchParams.get("orderId");       // Mã đơn hàng MoMo tạo
      const message = searchParams.get("message");

      // Lấy thông tin đơn hàng tạm từ localStorage
      const pendingOrderRaw = localStorage.getItem("pendingMomoOrder");

      if (!pendingOrderRaw) {
        setStatus("Không tìm thấy thông tin đơn hàng. Vui lòng thử lại!");
        return;
      }

      // Decode extraData đã btoa trước đó
      let orderData;
      try {
        orderData = safeAtob(pendingOrderRaw);
      } catch (err) {
        console.error("Lỗi decode pendingMomoOrder:", err);
        setStatus("Dữ liệu đơn hàng bị lỗi hoặc không hợp lệ!");
        localStorage.removeItem("pendingMomoOrder");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Phiên đăng nhập hết hạn. Vui lòng đặt hàng lại!");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      let idTaiKhoan = null;
      try {
        const decoded = jwtDecode(token);
        idTaiKhoan = decoded.idTaiKhoan || decoded.id || decoded.userId;
      } catch (err) {
        console.error("Token lỗi:", err);
      }

      // Nếu thanh toán THÀNH CÔNG (resultCode = 0)
      if (resultCode === "0") {
        try {
          setStatus("Thanh toán thành công! Đang tạo đơn hàng...");

          const payload = {
            request: {
              idTaiKhoan,
              hoTenNhan: orderData.hoTenNhan,
              sdtNhan: orderData.sdtNhan,
              diaChiGiao: orderData.diaChiGiao,
              ghiChu: orderData.ghiChu || null,
              phuongThucTT: "ONLINE",
              momoOrderId: orderId // lưu lại để đối soát sau nếu cần
            },
            chiTietDonHang: orderData.selectedItems.map(item => ({
              idSanPham: item.idSanPham || item.id,
              soLuong: item.soLuong,
              donGia: item.donGia
            }))
          };

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

            // === XÓA CHỈNH XÁC TỪNG SẢN PHẨM TRONG ĐƜN HÀNG (giống Checkout.jsx) ===
            const deletePromises = orderData.selectedItems.map(item =>
              fetch(`http://localhost:8081/cart/${item.idCtgh}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }).then(response => {
                if (!response.ok) {
                  console.warn(`Không thể xóa item idGh=${item.idGh} khỏi giỏ hàng`);
                }
              })
            );

            await Promise.all(deletePromises);

            // Cập nhật header giỏ hàng
            window.dispatchEvent(new CustomEvent("cart-updated", { detail: "refresh" }));

            // Xóa dữ liệu tạm
            localStorage.removeItem("pendingMomoOrder");

            setStatus(
              <span className="text-success fw-bold">
                ✓ Thanh toán và đặt hàng thành công!<br />
                Mã đơn hàng: <strong>#{result.id}</strong><br />
                Cảm ơn bạn đã mua sắm tại PerfumeShop!
              </span>
            );

            // Chuyển về trang chủ sau 5 giây
            setTimeout(() => {
              navigate("/client");
            }, 5000);

          } else {
            const err = await res.text();
            setStatus("Tạo đơn hàng thất bại: " + err);
          }
        } catch (err) {
          console.error(err);
          setStatus("Lỗi kết nối server khi tạo đơn hàng!");
        }
      }
      // Thanh toán THẤT BẠI hoặc bị HỦY
      else {
        localStorage.removeItem("pendingMomoOrder"); // xóa tạm để tránh tạo nhầm
        setStatus(
          <span className="text-danger fw-bold">
            Thanh toán không thành công!<br />
            Mã lỗi: {resultCode}<br />
            Thông báo: {message || "Bạn đã hủy thanh toán hoặc giao dịch bị từ chối"}<br /><br />
            <button className="btn btn-warning" onClick={() => navigate("/client/cart")}>
              ← Quay lại giỏ hàng
            </button>
          </span>
        );
      }
    };

    handleMomoReturn();
  }, [searchParams]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center p-5">
              <div className="mb-4">
                <img
                  src="https://developers.momo.vn/v3/vi/img/logo.svg"
                  alt="MoMo"
                  style={{ width: 80 }}
                />
              </div>
              <h3 className="mb-4">Xử lý kết quả thanh toán MoMo</h3>

              <div className="alert alert-info">
                <div style={{ fontSize: "1.2rem", minHeight: "100px" }}>
                  {status}
                </div>
              </div>

              <div className="mt-4">
                <div className="spinner-border text-warning" role="status" style={{ display: (status.includes && status.includes("Đang")) ? "inline-block" : "none" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}