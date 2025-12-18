import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export default function TonKhoReport({ token }) {
  const [filters, setFilters] = useState({
    productCode: "",
    categoryId: "",
    brandId: ""
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/products", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));

    fetch("http://localhost:8081/categories", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));

    fetch("http://localhost:8081/brands", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setBrands)
      .catch(() => setBrands([]));
  }, [token]);

  const handleChange = (e) =>
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 👉 chỉ append khi có giá trị
  const buildParams = () => {
    const params = new URLSearchParams();
    if (filters.productCode) params.append("productCode", filters.productCode);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.brandId) params.append("brandId", filters.brandId);
    return params.toString();
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8081/reports/tonkho?${buildParams()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(await res.json());
    } catch {
      alert("❌ Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!data.length) {
      setError("❌ Chưa có dữ liệu thống kê, không thể xuất Excel");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8081/reports/tonkho/export?${buildParams()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tonkho.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("❌ Không thể xuất Excel");
    }
  };

  // 👉 lọc sản phẩm theo danh mục và thương hiệu
  const filteredProducts = products.filter(p => {
    const matchCategory = filters.categoryId
      ? p.idDanhMuc === Number(filters.categoryId)
      : true;
    const matchBrand = filters.brandId
      ? p.idthuonghieu === Number(filters.brandId)
      : true;
    return matchCategory && matchBrand;
  });

  return (
    <div className="report p-4 bg-white rounded shadow">
      <h5>📊 Xuất - Nhập - Tồn kho</h5>
      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-3">
          <label>Sản phẩm</label>
          <select
            name="productCode"
            value={filters.productCode}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Tất cả sản phẩm theo bộ lọc</option>
            {filteredProducts.map(p => (
              <option key={p.idSanPham} value={p.idSanPham}>
                {p.idSanPham} - {p.tenSanPham}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>Danh mục</label>
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Tất cả</option>
            {categories.map(c => (
              <option key={c.idDanhMuc} value={c.idDanhMuc}>
                {c.idDanhMuc} - {c.tenDanhMuc}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>Thương hiệu</label>
          <select
            name="brandId"
            value={filters.brandId}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Tất cả</option>
            {brands.map(b => (
              <option key={b.idthuonghieu} value={b.idthuonghieu}>
                {b.idthuonghieu} - {b.tenthuonghieu}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 d-flex gap-2">
          <button className="btn btn-success w-100" onClick={handleFilter}>
            📊 Lọc dữ liệu
          </button>
          <button className="btn btn-outline-primary w-100" onClick={handleExport}>
            📥 Xuất Excel
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-2">{error}</div>}

      {loading ? (
        <div>⏳ Đang tải dữ liệu...</div>
      ) : !data.length ? (
        <div>Không có dữ liệu</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(500, data.length * 45)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="tenSanPham" width={150} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="soLuongNhap" fill="#198754" name="Nhập" barSize={15} />
            <Bar dataKey="soLuongBan" fill="#dc3545" name="Bán" barSize={15} />
            <Bar dataKey="tonKho" fill="#0d6efd" name="Tồn kho" barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
