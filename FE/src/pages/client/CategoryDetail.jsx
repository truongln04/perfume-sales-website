// src/pages/client/CategoryDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../../components/Client/ProductCard";
import Breadcrumb from "../../components/Common/Breadcrumb";
import Pagination from "../../components/Common/Pagination";

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState("all");

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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
        const giaSauKm =
          p.kmPhanTram > 0 ? p.giaBan - (p.giaBan * p.kmPhanTram) / 100 : p.giaBan;
        return giaSauKm >= min && (!max || giaSauKm <= max);
      });
    }
    setFilteredProducts(filtered);
    setCurrentPage(1); // reset về trang đầu khi đổi filter
  }, [priceFilter, products]);

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (!category) return null;

  // phân trang
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="container py-5">
      {/* Tiêu đề */}
      <h1 className="fw-bold mb-4 text-dark" style={{ fontSize: "1.5rem" }}>
        {category.tenDanhMuc}
      </h1>

      {/* Breadcrumb tái sử dụng */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", to: "/client" },
          { label: "Nước hoa", to: "/client/products" },
          { label: category.tenDanhMuc },
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

      {/* Grid sản phẩm */}
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
