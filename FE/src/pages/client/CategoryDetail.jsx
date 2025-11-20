// src/pages/client/CategoryDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CategoryDetail() {
  const { id } = useParams(); // idDanhMuc
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc giá
  const [priceFilter, setPriceFilter] = useState("all");

  useEffect(() => {
    const numId = Number(id);
    if (!id || isNaN(numId)) {
      navigate("/client");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      axios.get(`http://localhost:8081/categories/${numId}`, { headers }),
      axios.get(`http://localhost:8081/categories/${numId}/products`, { headers }),
    ])
      .then(([catRes, prodRes]) => {
        setCategory(catRes.data);
        const prods = prodRes.data.content || prodRes.data || [];
        setProducts(prods);
        setFilteredProducts(prods);
      })
      .catch(() => {
        alert("Không tìm thấy danh mục này!");
        navigate("/client");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Lọc theo giá
  useEffect(() => {
    let filtered = [...products];
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((p) => {
        const price = p.giaBan || 0;
        return price >= min && (!max || price <= max);
      });
    }
    setFilteredProducts(filtered);
  }, [priceFilter, products]);

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (!category) return null;

  // Tính giá sau khuyến mãi
  const getFinalPrice = (p) => {
    return p.kmPhanTram > 0
      ? p.giaBan - (p.giaBan * p.kmPhanTram) / 100
      : p.giaBan;
  };

  return (
    <div className="container py-5">

  {/* Tiêu đề */}
  <h1 className="fw-bold mb-4 text-dark" style={{ fontSize: "1.5rem" }}>
    {category.tenDanhMuc}
  </h1>

  {/* Breadcrumb - sang trái, chữ nhỏ, không gạch chân */}
  <nav aria-label="breadcrumb" className="mb-4">
    <ol className="breadcrumb m-0 p-0 bg-transparent">
      <li className="breadcrumb-item">
        <Link 
          to="/client" 
          className="text-muted text-decoration-none hover-text-dark"
          style={{ fontSize: "0.95rem" }}
        >
          Trang chủ
        </Link>
      </li>
      <li className="breadcrumb-item">
        <Link 
          to="/client/products" 
          className="text-muted text-decoration-none hover-text-dark"
          style={{ fontSize: "0.95rem" }}
        >
          Nước Hoa
        </Link>
      </li>
      <li 
        className="breadcrumb-item active text-dark fw-semibold" 
        aria-current="page"
        style={{ fontSize: "0.95rem" }}
      >
        {category.tenDanhMuc}
      </li>
    </ol>
  </nav>

  {/* Bộ lọc giá - sang trái, chữ nhỏ hơn, nút gọn */}
  <div className="d-flex flex-wrap align-items-center gap-3 mb-5">
    <span className="text-muted fw-medium me-2" style={{ fontSize: "0.95rem" }}>
      Lọc theo giá:
    </span>

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

      {/* Grid sản phẩm - giống hệt ảnh bạn gửi */}
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
        {filteredProducts.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">Không có sản phẩm nào.</div>
        ) : (
          filteredProducts.map((p) => (
            <div className="col" key={p.idSanPham}>
              <Link
                to={`/client/product/${p.idSanPham}`}
                className="card h-100 text-decoration-none text-dark position-relative overflow-hidden rounded-4 shadow-sm hover-shadow"
                style={{ transition: "all 0.3s", transform: "scale(0.96)" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
              >
                <div
                  className="bg-white"
                  style={{
                    height: "220px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.kmPhanTram > 0 && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">-{p.kmPhanTram}%</span>
                  )}
                  {(p.quaTang || p.giamGia > 0) && (
                    <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">QUÀ TẶNG</span>
                  )}
                  <img
                    src={p.hinhAnh || p.anhSanPham || "/placeholder.jpg"}
                    alt={p.tenSanPham}
                    className="img-fluid"
                    style={{ maxHeight: "100%", objectFit: "contain" }}
                    loading="lazy"
                  />
                </div>

                <div className="card-body p-3 text-center">
                  <p className ="small text-muted text-uppercase mb-1">
                    {p.tenThuongHieu || "ORCHARD"}
                  </p>
                  <h6 className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
                    {p.tenSanPham}
                  </h6>

                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    <span className="text-danger fw-bold fs-6">
                      {Math.round(getFinalPrice(p)).toLocaleString()} ₫
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
          ))
        )}
      </div>
    </div>
  );
}