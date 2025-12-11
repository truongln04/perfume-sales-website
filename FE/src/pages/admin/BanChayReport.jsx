import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BanChayReport({ token }) {
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", category: "", brand: "", top: "10" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setCategories).catch(() => setCategories([]));
    fetch("http://localhost:8081/brands", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setBrands).catch(() => setBrands([]));
  }, [token]);

  const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const buildParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  };

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
      const res = await fetch(`http://localhost:8081/reports/banchay?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch(`http://localhost:8081/reports/banchay/export?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "banchay.xlsx"; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("❌ Không thể xuất Excel"); }
  };

  return (
    <div className="report p-4 bg-white rounded shadow">
      <h5>📊 Sản phẩm bán chạy</h5>
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
          <label>Danh mục</label>
          <select name="category" value={filters.category} onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            {categories.map(c => <option key={c.idDanhMuc} value={c.tenDanhMuc}>{c.tenDanhMuc}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label>Thương hiệu</label>
          <select name="brand" value={filters.brand} onChange={handleChange} className="form-select">
            <option value="">Tất cả</option>
            {brands.map(b => <option key={b.idthuonghieu} value={b.tenthuonghieu}>{b.tenthuonghieu}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label>Top sản phẩm</label>
          <select name="top" value={filters.top} onChange={handleChange} className="form-select">
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
          </select>
        </div>
        <div className="col-md-4 d-flex gap-2 mt-2">
          <button className="btn btn-success w-100" onClick={handleFilter}>📊 Lọc dữ liệu</button>
          <button className="btn btn-outline-primary w-100" onClick={handleExport}>📥 Xuất Excel</button>
        </div>
      </div>
      {error && <div className="alert alert-danger mt-2">{error}</div>}

      {loading ? <div>⏳ Đang tải dữ liệu...</div> :
        !data.length ? <div>Không có dữ liệu</div> :
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="tenSanPham" width={120} />
              <Tooltip />
              <Bar dataKey="tongBan" fill="#0d6efd" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
      }
    </div>
  );
}