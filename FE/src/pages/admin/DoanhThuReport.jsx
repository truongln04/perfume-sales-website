import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DoanhThuReport({ token }) {
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", payment: "", paymentStatus: "" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const buildParams = () => Object.entries(filters).reduce((p, [k, v]) => (v ? p.append(k, v) : p, p), new URLSearchParams()).toString();

  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/reports/doanhthu?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json.map(d => ({ ...d, ngay: new Date(d.ngay).toLocaleDateString("en-CA")  })));
    } catch { alert("❌ Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`http://localhost:8081/reports/doanhthu/export?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "doanhthu.xlsx"; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("❌ Không thể xuất Excel"); }
  };

  return (
    <div className="report p-4 bg-white rounded shadow">
      <h5>📊 Doanh thu theo thời gian</h5>
      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-3">
          <label>Từ ngày</label>
          <input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} className="form-control"/>
        </div>
        <div className="col-md-3">
          <label>Đến ngày</label>
          <input type="date" name="toDate" value={filters.toDate} onChange={handleChange} className="form-control"/>
        </div>
        <div className="col-md-3">
          <label>Phương thức thanh toán</label>
          <select name="payment" onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            <option value="COD">COD</option>
            <option value="ONLINE">ONLINE</option>
          </select>
        </div>
        <div className="col-md-3">
          <label>Trạng thái thanh toán</label>
          <select name="paymentStatus" onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
            <option value="DA_THANH_TOAN">Đã thanh toán</option>
            <option value="HOAN_TIEN">Hoàn tiền</option>

          </select>
        </div>
        <div className="col-md-4 d-flex gap-2">
          <button className="btn btn-success w-100" onClick={handleFilter}>📊 Lọc dữ liệu</button>
          <button className="btn btn-outline-primary w-100" onClick={handleExport}>📥 Xuất Excel</button>
        </div>
      </div>

      {loading ? <div>⏳ Đang tải dữ liệu...</div> :
        !data.length ? <div>Không có dữ liệu</div> :
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="ngay" width={100} />
            <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
            <Bar dataKey="doanhThu" fill="#0d6efd" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      }
    </div>
  );
}
