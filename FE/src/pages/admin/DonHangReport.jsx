import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DonHangReport({ token }) {
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", orderStatus: "" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const buildParams = () => Object.entries(filters).reduce((p, [k, v]) => (v ? p.append(k, v) : p, p), new URLSearchParams()).toString();
  const [error, setError] = useState("");

  const handleFilter = async () => {
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      if (to < from) {
        setError("❌ Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu");
        setTimeout(() => setError(""), 3000); // 3 giây sau tự xoá
        return;
      }
    }
    setError(""); // xoá lỗi nếu hợp lệ

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/reports/donhang?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(await res.json());
    } catch { alert("❌ Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    if (!data.length) {
    setError("❌ Chưa có dữ liệu thống kê, không thể xuất Excel");
    setTimeout(() => setError(""), 3000); 
    return;
  }
    try {
      const res = await fetch(`http://localhost:8081/reports/donhang/export?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "donhang.xlsx"; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("❌ Không thể xuất Excel"); }
  };

  return (
    <div className="report p-4 bg-white rounded shadow">
      <h5>📊 Đơn hàng theo trạng thái</h5>
      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-3">
          <label>Từ ngày</label>
          <input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-3">
          <label>Đến ngày</label>
          <input type="date" name="toDate" value={filters.toDate} onChange={handleChange} className="form-control" />
        </div>
        <div className="col-md-3">
          <label>Trạng thái đơn hàng</label>
          <select name="orderStatus" value={filters.orderStatus} onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DA_XAC_NHAN">Đã xác nhận</option>
            <option value="DANG_GIAO">Đang giao</option>
            <option value="HOAN_THANH">Hoàn thành</option>
            <option value="HUY">Hủy</option>
          </select>
        </div>
        <div className="col-md-4 d-flex gap-2">
          <button className="btn btn-success w-100" onClick={handleFilter}>📊 Lọc dữ liệu</button>
          <button className="btn btn-outline-primary w-100" onClick={handleExport}>📥 Xuất Excel</button>
        </div>
      </div>
      {error && <div className="alert alert-danger mt-2">{error}</div>}

      {loading ? <div>⏳ Đang tải dữ liệu...</div> :
        !data.length ? <div>Không có dữ liệu</div> :
          <ResponsiveContainer width="100%" height={330}>
            <PieChart>
              <Pie data={data} dataKey="soLuong" nameKey="trangThai" outerRadius={100} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"][i % 5]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
      }
    </div>
  );
}