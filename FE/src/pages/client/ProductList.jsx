import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/Client/ProductCard";
import Breadcrumb from "../../components/Common/Breadcrumb";
import Pagination from "../../components/Common/Pagination";

export default function ProductsList({ categoryId, title = "Nước hoa" }) {
  const [products, setProducts] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const token = localStorage.getItem("token");
      axios.get("http://localhost:8081/products/active", {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
})
.then((res) => setProducts(res.data))
.catch(() => setProducts([]));

  }, [categoryId]);

  const filteredProducts = products.filter((p) => {
    const giaSauKm =
      p.giaBan && p.kmPhanTram
        ? Math.round(p.giaBan * (1 - p.kmPhanTram / 100))
        : p.giaBan;
    if (priceFilter === "0-2000000") return giaSauKm < 2000000;
    if (priceFilter === "2000000-4000000") return giaSauKm >= 2000000 && giaSauKm <= 4000000;
    if (priceFilter === "4000001-999999999") return giaSauKm > 4000000;
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="container py-4 my-4">
        {/* Tiêu đề */}
      <h4 className="fw-bold mb-3">{title}</h4>

      {/* Breadcrumb tái sử dụng */}
      <Breadcrumb items={[{ label: "Trang chủ", to: "/client" }, { label: title }]} />

      {/* Bộ lọc giá */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <span className="text-muted fw-medium me-2" style={{ fontSize: "0.95rem" }}>
          Lọc theo giá:
        </span>
        {["all", "0-2000000", "2000000-4000000", "4000001-999999999"].map((range) => (
          <button
            key={range}
            className={`btn btn-sm rounded-pill px-4 ${
              priceFilter === range ? "btn-dark" : "btn-outline-secondary"
            }`}
            onClick={() => {
              setPriceFilter(range);
              setCurrentPage(1);
            }}
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
        {paginatedProducts.map((p) => (
          <div className="col" key={p.idSanPham}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Phân trang tái sử dụng */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </section>
  );
}
