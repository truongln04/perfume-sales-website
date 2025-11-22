import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TonKhoReport({ token }) {
  const [filters, setFilters] = useState({ productCode: "", category: "", brand: "" });
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
  const buildParams = () => Object.entries(filters).reduce((p,[k,v])=>(v?p.append(k,v):p,p),new URLSearchParams()).toString();

  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/reports/tonkho?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(await res.json());
    } catch { alert("❌ Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`http://localhost:8081/reports/tonkho/export?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "tonkho.xlsx"; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("❌ Không thể xuất Excel"); }
  };

  return (
    <div className="report p-4 bg-white rounded shadow">
      <h5>📊 Xuất – Nhập – Tồn kho</h5>
      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-3">
          <label>Mã sản phẩm</label>
          <input type="text" name="productCode" value={filters.productCode} onChange={handleChange} className="form-control"/>
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
            {brands.map(b => <option key={b.idThuongHieu} value={b.tenThuongHieu}>{b.tenThuongHieu}</option>)}
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
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="tenSanPham" width={120} />
            <Tooltip />
            <Bar dataKey="soLuongNhap" stackId="a" fill="#198754" barSize={15} />
            <Bar dataKey="soLuongBan" stackId="a" fill="#dc3545" barSize={15} />
            <Bar dataKey="tonKho" fill="#0d6efd" barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      }
    </div>
  );
}