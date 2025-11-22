import { useState } from "react";
import DoanhThuReport from "./DoanhThuReport";
import DonHangReport from "./DonHangReport";
import TonKhoReport from "./TonKhoReport";
import BanChayReport from "./BanChayReport";

export default function Reports() {
  const [type, setType] = useState("doanhthu");
  const token = localStorage.getItem("token");

  const renderReport = () => {
    switch (type) {
      case "doanhthu":
        return <DoanhThuReport token={token} />;
      case "donhang":
        return <DonHangReport token={token} />;
      case "tonkho":
        return <TonKhoReport token={token} />;
      case "banchay":
        return <BanChayReport token={token} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <h3 className="text-primary fw-bold mb-4">📊 THỐNG KÊ HỆ THỐNG</h3>

      <div className="row g-3 align-items-end mb-4">
        <div className="col-md-4">
          <label className="form-label">Loại thống kê</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="doanhthu">Doanh thu theo thời gian</option>
            <option value="donhang">Đơn hàng theo trạng thái</option>
            <option value="tonkho">Xuất – Nhập – Tồn kho</option>
            <option value="banchay">Sản phẩm bán chạy</option>
          </select>
        </div>
      </div>

      <div>{renderReport()}</div>
    </div>
  );
}
