// src/pages/client/BrandDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../../components/Client/ProductCard";
import Pagination from "../../components/Common/Pagination";
import Breadcrumb from "../../components/Common/Breadcrumb";

export default function BrandDetail() {
  const { id } = useParams(); // idThuongHieu từ URL: /client/brand/1
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc giá
  const [priceFilter, setPriceFilter] = useState("all");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      axios.get(`http://localhost:8081/brands/${id}`, { headers }),
      axios.get(`http://localhost:8081/brands/${id}/products`, { headers }),
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

  // Lọc theo giá
  useEffect(() => {
    let filtered = [...products];
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((p) => {
        const giaSauKm =
          p.kmPhanTram > 0 ? p.giaBan - (p.giaBan * p.kmPhanTram) / 100 : p.giaBan;
        return giaSauKm >= min && (!max || giaSauKm <= max);
      });
    }
    setFilteredProducts(filtered);
    setCurrentPage(1); // reset về trang đầu khi đổi filter
  }, [priceFilter, products]);

  if (loading) {
    return <div className="text-center py-5">Đang tải sản phẩm {brand?.tenThuongHieu}...</div>;
  }

  if (!brand) {
    return <div className="text-center py-5 text-danger">Không tìm thấy thương hiệu!</div>;
  }

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="container py-5">
      {/* Tiêu đề */}
      <h1 className="fw-bold mb-4 text-dark" style={{ fontSize: "1.5rem" }}>
        Nước hoa {brand.tenthuonghieu}
      </h1>

      {/* Breadcrumb tái sử dụng */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", to: "/client" },
          { label: "Nước hoa", to: "/client/products" },
          { label: brand.tenthuonghieu },
        ]}
      />

      {/* Bộ lọc giá */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-5">
        <span className="text-muted fw-medium me-2" style={{ fontSize: "0.95rem" }}>
          Lọc theo giá:
        </span>
        {["all", "0-2000000", "2000000-4000000", "4000001-999999999"].map((range) => (
          <button
            key={range}
            className={`btn btn-sm rounded-pill px-4 ${
              priceFilter === range ? "btn-dark" : "btn-outline-secondary"
            }`}
            onClick={() => setPriceFilter(range)}
            style={{ fontSize: "0.875rem" }}
          >
            {range === "all"
              ? "Tất cả"
              : range === "0-2000000"
              ? "Dưới 2 triệu"
              : range === "2000000-4000000"
              ? "2 - 4 triệu"
              : "Trên 4 triệu"}
          </button>
        ))}
      </div>

      {/* Danh sách sản phẩm */}
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
        {paginatedProducts.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">Không có sản phẩm nào.</div>
        ) : (
          paginatedProducts.map((p) => (
            <div className="col" key={p.idSanPham}>
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>

      {/* Phân trang tái sử dụng */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        variant="client"
      />
    </div>
  );
}
