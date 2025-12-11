import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function DoanhThuReport({ token }) {
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", payment: "", paymentStatus: "" });
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
      const res = await fetch(`http://localhost:8081/reports/doanhthu?${buildParams()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json.map(d => ({ ...d, ngay: new Date(d.ngay).toLocaleDateString("en-CA") })));
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
    const res = await fetch(`http://localhost:8081/reports/doanhthu/export?${buildParams()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "doanhthu.xlsx"; a.click();
    window.URL.revokeObjectURL(url);
  } catch {
    alert("❌ Không thể xuất Excel");
  }
};


  return (
    <div className="report p-4 bg-white rounded shadow">
      <h5>📊 Doanh thu theo thời gian</h5>
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
          <label>Phương thức thanh toán</label>
          <select name="payment" onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            <option value="COD">COD</option>
            <option value="ONLINE">ONLINE</option>
          </select>
        </div>

        {/* <div className="col-md-3">
          <label>Trạng thái thanh toán</label>
          <select name="paymentStatus" onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
            <option value="DA_THANH_TOAN">Đã thanh toán</option>
            <option value="HOAN_TIEN">Hoàn tiền</option>

          </select>
        </div> */}

        <div className="col-md-4 d-flex gap-2">
          <button className="btn btn-success w-100" onClick={handleFilter}>📊 Lọc dữ liệu</button>
          <button className="btn btn-outline-primary w-100" onClick={handleExport}>📥 Xuất Excel</button>
        </div>
      </div>
      {error && <div className="alert alert-danger mt-2">{error}</div>}


      {loading ? <div>⏳ Đang tải dữ liệu...</div> :
        !data.length ? <div>Không có dữ liệu</div> :
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ngay" />
              <YAxis />
              <Tooltip formatter={(value) =>
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
              } />
              <Legend />
              <Line
                type="monotone"
                dataKey="doanhThu"
                stroke="#0d6efd"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
      }
    </div>

  );
}
