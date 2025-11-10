import { useState } from "react";
import {
  Line, Bar, Pie,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Reports() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    product: "",
    type: "doanhthu",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    alert("Đã xuất báo cáo ra Excel (giả lập)");
  };

  const handleFilter = () => {
    alert("Đã lọc dữ liệu theo điều kiện (giả lập)");
  };

  const renderDynamicFilters = () => {
    switch (filters.type) {
      case "doanhthu":
        return (
          <>
            <div className="col-md-4">
              <label className="form-label">Từ ngày</label>
              <input type="date" className="form-control" name="fromDate" value={filters.fromDate} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Đến ngày</label>
              <input type="date" className="form-control" name="toDate" value={filters.toDate} onChange={handleChange} />
            </div>
          </>
        );
      case "banchay":
      case "tonkho":
        return (
          <div className="col-md-6">
            <label className="form-label">Lọc theo sản phẩm</label>
            <input type="text" className="form-control" name="product" value={filters.product} onChange={handleChange} placeholder="Tên hoặc mã SP" />
          </div>
        );
      case "donhang":
        return (
          <div className="col-md-6">
            <label className="form-label">Trạng thái đơn hàng</label>
            <select className="form-select" name="status" value={filters.status} onChange={handleChange}>
              <option value="">Tất cả</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Hủy">Hủy</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const dataSets = {
    doanhthu: {
      labels: ["01/11", "02/11", "03/11", "04/11", "05/11", "06/11", "07/11"],
      data: [50000000, 60000000, 45000000, 70000000, 80000000, 65000000, 90000000],
    },
    donhang: {
      labels: ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Hủy"],
      data: [20, 15, 10, 50, 5],
    },
    tonkho: {
      labels: ["SP001", "SP002", "SP003"],
      nhap: [100, 150, 200],
      xuat: [60, 100, 120],
      ton: [40, 50, 80],
    },
    banchay: {
      labels: ["SP001", "SP002", "SP003", "SP004", "SP005", "SP006", "SP007", "SP008", "SP009", "SP010"],
      data: [120, 110, 100, 90, 85, 80, 75, 70, 65, 60],
    },
  };

  const renderChart = () => {
    switch (filters.type) {
      case "doanhthu":
        return (
          <Line
            data={{
              labels: dataSets.doanhthu.labels,
              datasets: [
                {
                  label: "Doanh thu (VNĐ)",
                  data: dataSets.doanhthu.data,
                  borderColor: "blue",
                  backgroundColor: "rgba(0,123,255,0.2)",
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{ responsive: true }}
          />
        );
      case "donhang":
        return (
          <Pie
            data={{
              labels: dataSets.donhang.labels,
              datasets: [
                {
                  data: dataSets.donhang.data,
                  backgroundColor: ["#ffc107", "#17a2b8", "#6f42c1", "#28a745", "#dc3545"],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        );
      case "tonkho":
        return (
          <Bar
            data={{
              labels: dataSets.tonkho.labels,
              datasets: [
                { label: "Nhập", data: dataSets.tonkho.nhap, backgroundColor: "#007bff" },
                { label: "Xuất", data: dataSets.tonkho.xuat, backgroundColor: "#ffc107" },
                { label: "Tồn", data: dataSets.tonkho.ton, backgroundColor: "#28a745" },
              ],
            }}
            options={{ indexAxis: "y", responsive: true }}
          />
        );
      case "banchay":
        return (
          <Bar
            data={{
              labels: dataSets.banchay.labels,
              datasets: [
                {
                  label: "Số lượng bán",
                  data: dataSets.banchay.data,
                  backgroundColor: "#6610f2",
                },
              ],
            }}
            options={{ responsive: true }}
          />
        );
      default:
        return <p className="text-muted">Chọn loại thống kê để hiển thị biểu đồ.</p>;
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <h4 className="text-primary fw-bold mb-3">📊 THỐNG KÊ HỆ THỐNG BÁN NƯỚC HOA</h4>

      <div className="card mb-4">
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Loại thống kê</label>
            <select className="form-select" name="type" value={filters.type} onChange={handleChange}>
              <option value="doanhthu">Doanh thu theo thời gian</option>
              <option value="donhang">Đơn hàng theo trạng thái</option>
              <option value="tonkho">Nhập - Xuất - Tồn kho</option>
              <option value="banchay">Top sản phẩm bán chạy</option>
            </select>
          </div>
          {renderDynamicFilters()}
          <div className="col-md-6 d-flex gap-2">
            <button className="btn btn-success w-100" onClick={handleFilter}>📊 Lọc dữ liệu</button>
            <button className="btn btn-outline-primary w-100" onClick={handleExport}>📥 Xuất Excel</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">🔍 Kết quả thống kê: <span className="text-info">{filters.type}</span></h5>
          <div style={{ maxHeight: 400 }}>{renderChart()}</div>
        </div>
      </div>
    </div>
  );
}
