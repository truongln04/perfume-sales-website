import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

export default function Reports() {
  const [filters, setFilters] = useState({
    type: "doanhthu",
    fromDate: "",
    toDate: "",
    payment: "",
    paymentStatus: "",
    orderStatus: "",
    productCode: "",
    category: "",
    brand: "",
    top: "10",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Lấy token từ localStorage (sau khi login bạn lưu token vào đây)
  const token = localStorage.getItem("token");

  useEffect(() => {
    // gọi API lấy categories
    fetch("http://localhost:8081/categories", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => setCategories(json))
      .catch(() => setCategories([]));

    // gọi API lấy brands
    fetch("http://localhost:8081/brands", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => setBrands(json))
      .catch(() => setBrands([]));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && k !== "type") params.append(k, v);
    });

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/api/reports/${filters.type}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch {
      alert("❌ Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && k !== "type") params.append(k, v);
    });

    try {
      const res = await fetch(`http://localhost:8081/api/reports/${filters.type}/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filters.type}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("❌ Không thể xuất Excel");
    }
  };

  const renderFilters = () => {
    switch (filters.type) {
      case "doanhthu":
        return (
          <>
            <DateRange filters={filters} handleChange={handleChange} />
            <Select name="payment" label="Phương thức thanh toán" options={["COD", "ONLINE"]} handleChange={handleChange} />
            <Select name="paymentStatus" label="Trạng thái thanh toán" options={["Chưa thanh toán", "Đã thanh toán", "Hoàn tiền"]} handleChange={handleChange} />
          </>
        );
      case "donhang":
        return (
          <>
            <DateRange filters={filters} handleChange={handleChange} />
            <Select name="orderStatus" label="Trạng thái đơn hàng" options={["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Hủy"]} handleChange={handleChange} />
          </>
        );
      case "tonkho":
        return (
          <>
            <Input name="productCode" label="Mã sản phẩm" value={filters.productCode} handleChange={handleChange} />
            <Select name="category" label="Danh mục" options={categories.map(c => c.tenDanhMuc)} handleChange={handleChange} />
            <Select name="brand" label="Thương hiệu" options={brands.map(b => b.tenThuongHieu)} handleChange={handleChange} />
          </>
        );
      case "banchay":
        return (
          <>
            <DateRange filters={filters} handleChange={handleChange} />
            <Select name="category" label="Danh mục" options={categories.map(c => c.tenDanhMuc)} handleChange={handleChange} />
            <Select name="brand" label="Thương hiệu" options={brands.map(b => b.tenThuongHieu)} handleChange={handleChange} />
            <Select name="top" label="Top sản phẩm" options={["5", "10", "20"]} handleChange={handleChange} />
          </>
        );
      default:
        return null;
    }
  };

 const renderChart = () => {
  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!data.length) return <div>Không có dữ liệu</div>;

  switch (filters.type) {
    case "doanhthu":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="ngay" width={100} />
            <Tooltip />
            <Bar dataKey="doanhThu" fill="#0d6efd" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      );
    case "donhang":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              dataKey="soLuong"
              data={data}
              nameKey="trangThai"
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={[
                    "#0d6efd",
                    "#198754",
                    "#ffc107",
                    "#dc3545",
                    "#6f42c1",
                    "#20c997",
                    "#fd7e14",
                  ][i % 7]}
                />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    case "tonkho":
      return (
        <ResponsiveContainer width="100%" height={250}>
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
      );
    case "banchay":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="tenSanPham" width={120} />
            <Tooltip />
            <Bar dataKey="tongBan" fill="#0d6efd" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      );
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
            name="type"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="doanhthu">Doanh thu theo thời gian</option>
            <option value="donhang">Đơn hàng theo trạng thái</option>
            <option value="tonkho">Xuất-Nhập-Tồn kho</option>
            <option value="banchay">Sản phẩm bán chạy</option>
          </select>
        </div>

        {renderFilters()}

        <div className="col-md-4 d-flex gap-2">
          <button className="btn btn-success w-100" onClick={handleFilter}>
            📊 Lọc dữ liệu
          </button>
          <button className="btn btn-outline-primary w-100" onClick={handleExport}>
            📥 Xuất Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h5 className="mb-3">
          🔍 Kết quả: <span className="text-info">{filters.type}</span>
        </h5>
        {renderChart()}
      </div>
    </div>
  );
}

// Subcomponents
function DateRange({ filters, handleChange }) {
  return (
    <>
      <div className="col-md-3">
        <label className="form-label">Từ ngày</label>
        <input
          type="date"
          className="form-control"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Đến ngày</label>
        <input
          type="date"
          className="form-control"
          name="toDate"
          value={filters.toDate}
          onChange={handleChange}
        />
      </div>
    </>
  );
}

function Select({ name, label, options, handleChange }) {
  return (
    <div className="col-md-3">
      <label className="form-label">{label}</label>
      <select className="form-select" name={name} onChange={handleChange}>
        <option value="">Tất cả</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}


function Input({ name, label, value, handleChange }) {
  return (
    <div className="col-md-3">
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-control"
        name={name}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
