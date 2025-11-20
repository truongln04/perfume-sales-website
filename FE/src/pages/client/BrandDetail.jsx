// src/pages/client/BrandDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function BrandDetail() {
  const { id } = useParams(); // idThuongHieu từ URL: /client/brand/1
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [priceFilter, setPriceFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [scentFilter, setScentFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Lấy thông tin thương hiệu + sản phẩm của thương hiệu
    Promise.all([
      axios.get(`http://localhost:8081/brands/${id}`, { headers }),
      axios.get(`http://localhost:8081/brands/${id}/products`, { headers }), // API bạn sẽ thêm ở dưới
    ])
      .then(([brandRes, productsRes]) => {
        setBrand(brandRes.data);
        const prods = productsRes.data.content || productsRes.data || [];
        setProducts(prods);
        setFilteredProducts(prods);
      })
      .catch((err) => {
        console.error("Lỗi tải dữ liệu thương hiệu:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Lọc sản phẩm theo các tiêu chí
  useEffect(() => {
    let filtered = [...products];

    // Lọc theo giá
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((p) => {
        const price = p.giaBan || p.gia || 0;
        return price >= min && (!max || price <= max);
      });
    }

    // Lọc theo giới tính (giả sử có field gioiTinh hoặc tenSanPham chứa "Nam"/"Nữ")
    if (genderFilter !== "all") {
      filtered = filtered.filter((p) =>
        p.tenSanPham.toLowerCase().includes(genderFilter.toLowerCase())
      );
    }

    // Lọc nhóm hương (nếu có field nhomHuong)
    if (scentFilter !== "all") {
      filtered = filtered.filter((p) =>
        p.nhomHuong?.toLowerCase().includes(scentFilter.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [priceFilter, genderFilter, scentFilter, products]);

  if (loading) {
    return <div className="text-center py-5">Đang tải sản phẩm {brand?.tenThuongHieu}...</div>;
  }

  if (!brand) {
    return <div className="text-center py-5 text-danger">Không tìm thấy thương hiệu!</div>;
  }

  return (
    <div className="container py-5">

  {/* Tiêu đề - nhỏ hơn, vừa mắt */}
  <h1 className="fw-bold mb-4 text-dark" style={{ fontSize: "1.5rem" }}>
    Nước hoa {brand.tenThuongHieu}
  </h1>

  {/* Breadcrumb - sang trái, chữ nhỏ, không gạch chân */}
  <nav aria-label="breadcrumb" className="mb-4">
    <ol className="breadcrumb m-0 p-0 bg-transparent">
      <li className="breadcrumb-item">
        <Link 
          to="/client" 
          className="text-muted text-decoration-none hover-text-dark transition"
          style={{ fontSize: "0.95rem" }}
        >
          Trang chủ
        </Link>
      </li>
      <li className="breadcrumb-item">
        <Link 
          to="/client/products" 
          className="text-muted text-decoration-none hover-text-dark transition"
          style={{ fontSize: "0.95rem" }}
        >
          Nước Hoa
        </Link>
      </li>
      <li className="breadcrumb-item">
        <Link 
          to="/client/brand" 
          className="text-muted text-decoration-none hover-text-dark transition"
          style={{ fontSize: "0.95rem" }}
        >
          Thương hiệu nước hoa
        </Link>
      </li>
      <li 
        className="breadcrumb-item active text-dark fw-semibold" 
        aria-current="page"
        style={{ fontSize: "0.95rem" }}
      >
        {brand.tenThuongHieu}
      </li>
    </ol>
  </nav>

  {/* Bộ lọc - căn trái, chữ nhỏ, gọn đẹp */}
  <div className="d-flex flex-wrap align-items-center gap-3 mb-5">
    <span className="text-muted fw-medium me-2" style={{ fontSize: "0.95rem" }}>
      Lọc theo:
    </span>

    {/* Nhóm hương */}
    <select
      className="form-select form-select-sm rounded-pill"
      style={{ width: "auto", minWidth: "140px", fontSize: "0.875rem" }}
      value={scentFilter}
      onChange={(e) => setScentFilter(e.target.value)}
    >
      <option value="all">Nhóm Hương</option>
      <option value="hương gỗ">Hương Gỗ</option>
      <option value="hương biển">Hương Biển</option>
      <option value="hoa cỏ">Hoa Cỏ</option>
      <option value="trái cây">Trái Cây</option>
    </select>

    {/* Giới tính */}
    <select
      className="form-select form-select-sm rounded-pill"
      style={{ width: "auto", minWidth: "120px", fontSize: "0.875rem" }}
      value={genderFilter}
      onChange={(e) => setGenderFilter(e.target.value)}
    >
      <option value="all">Nam / Nữ</option>
      <option value="nam">Nam</option>
      <option value="nữ">Nữ</option>
      <option value="unisex">Unisex</option>
    </select>

    {/* Giá */}
    <button
      className={`btn btn-sm rounded-pill px-4 ${priceFilter === "all" ? "btn-dark" : "btn-outline-secondary"}`}
      onClick={() => setPriceFilter("all")}
      style={{ fontSize: "0.875rem" }}
    >
      Tất cả
    </button>
    <button
      className={`btn btn-sm rounded-pill px-4 ${priceFilter === "0-2000000" ? "btn-dark" : "btn-outline-secondary"}`}
      onClick={() => setPriceFilter("0-2000000")}
      style={{ fontSize: "0.875rem" }}
    >
      Dưới 2 triệu
    </button>
    <button
      className={`btn btn-sm rounded-pill px-4 ${priceFilter === "2000000-4000000" ? "btn-dark" : "btn-outline-secondary"}`}
      onClick={() => setPriceFilter("2000000-4000000")}
      style={{ fontSize: "0.875rem" }}
    >
      2 - 4 triệu
    </button>
    <button
      className={`btn btn-sm rounded-pill px-4 ${priceFilter === "4000001-999999999" ? "btn-dark" : "btn-outline-secondary"}`}
      onClick={() => setPriceFilter("4000001-999999999")}
      style={{ fontSize: "0.875rem" }}
    >
      Trên 4 triệu
    </button>
  </div>

      {/* Danh sách sản phẩm */}
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3 g-md-4">
  {filteredProducts.length === 0 ? (
    <div className="col-12 text-center py-5">
      <p className="text-muted fs-5">Không tìm thấy sản phẩm nào phù hợp.</p>
    </div>
  ) : (
    filteredProducts.map((p) => {
      // Tính giá sau khuyến mãi (nếu có)
      const giaSauKm = p.kmPhanTram > 0 
        ? p.giaBan - (p.giaBan * p.kmPhanTram / 100)
        : p.giaBan;

      return (
        <div className="col" key={p.idSanPham}>
          <Link
            to={`/client/product/${p.idSanPham}`}
            className="card h-100 text-center text-decoration-none text-dark position-relative overflow-hidden"
            style={{
              opacity: 0.95,
              transform: "scale(0.95)",
              transition: "all 0.35s ease",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.95";
              e.currentTarget.style.transform = "scale(0.95)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
            }}
          >
            {/* Ảnh + Badge giảm giá */}
            <div
              className="bg-white position-relative"
              style={{
                height: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 0",
              }}
            >
              {p.kmPhanTram > 0 && (
                <span
                  className="badge bg-danger position-absolute top-0 start-0 m-2 fw-bold"
                  style={{ zIndex: 10, fontSize: "0.85rem" }}
                >
                  -{p.kmPhanTram}%
                </span>
              )}
              {p.giamGia > 0 || p.quaTang === true && (
                <span
                  className="badge bg-warning text-dark position-absolute top-0 end-0 m-2 fw-bold"
                  style={{ zIndex: 10, fontSize: "0.8rem" }}
                >
                  QUÀ TẶNG
                </span>
              )}
              <img
                src={p.hinhAnh || p.anhSanPham || "/placeholder.jpg"}
                alt={p.tenSanPham}
                className="img-fluid"
                style={{
                  maxHeight: "100%",
                  maxWidth: "85%",
                  objectFit: "contain",
                }}
                loading="lazy"
              />
            </div>

            {/* Thông tin bên dưới */}
            <div className="card-body p-3 pt-2">
              <p className="text-muted small mb-1 fw-medium text-uppercase opacity-75">
                {p.tenThuongHieu || p.thuongHieu || brand?.tenThuongHieu || "ORCHARD"}
              </p>
              <h6 className="fw-bold mb-2" style={{ fontSize: "0.92rem", lineHeight: "1.3" }}>
                {p.tenSanPham}
              </h6>

              <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap mt-2">
                <span className="text-danger fw-bold fs-5">
                  {Math.round(giaSauKm).toLocaleString()} ₫
                </span>
                {p.kmPhanTram > 0 && (
                  <span className="text-muted small text-decoration-line-through">
                    {p.giaBan.toLocaleString()} ₫
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      );
    })
  )}
</div>
    </div>
  );
}