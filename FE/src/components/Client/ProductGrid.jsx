import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductGrid({ categoryId, title, linkText }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8081/products?category=${categoryId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setProducts(res.data.slice(0, 10)))
      .catch(() => setProducts([]));
  }, [categoryId]);

  return (
    <section className="container py-5 my-5">
      {/* Tiêu đề + Xem thêm */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="fw-bold fs-3 text-dark">{title}</h2>
        <a
          href={`/client/category/${categoryId}`}
          className="text-primary text-decoration-none fw-medium fs-5"
        >
          {linkText} ›
        </a>
      </div>

      {/* Grid sản phẩm - chuẩn Orchard */}
      <div className="row g-3 g-xl-4">
        {products.map((p) => (
          <div className="col-6 col-sm-4 col-lg-25" key={p.idSanPham}>
            <div className="text-center position-relative">
              {/* Badge QUÀ TẶNG đỏ nghiêng chuẩn Orchard */}
              <div
                className="position-absolute start-0 top-0 z-10"
                style={{
                  transform: "translate(-18%, -35%) rotate(-15deg)",
                }}
              >
                <span
                  className="d-block bg-danger text-white text-center fw-bold px-3 py-2 rounded-2 shadow-lg"
                  style={{
                    fontSize: "0.85rem",
                    letterSpacing: "1px",
                    border: "4px solid white",
                    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  QUÀ TẶNG
                  <br />
                  <small style={{ fontSize: "0.65rem", fontWeight: "600" }}>
                    Trị giá đến 248k
                  </small>
                </span>
              </div>

              {/* Ảnh sản phẩm */}
              <a href={`/products/${p.idSanPham}`} className="d-block">
                <div
                  className="bg-white rounded-3 shadow-sm overflow-hidden"
                  style={{
                    height: "360px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px 0",
                  }}
                >
                  <img
                    src={p.hinhAnh || "/placeholder.jpg"}
                    alt={p.tenSanPham}
                    className="img-fluid"
                    style={{
                      maxHeight: "100%",
                      width: "auto",
                      objectFit: "contain",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    loading="lazy"
                  />
                </div>
              </a>

              {/* Thông tin sản phẩm */}
              <div className="mt-4">
                <p className="text-muted small mb-1 fw-medium text-uppercase tracking-wider">
                  {p.thuongHieu || "ORCHARD"}
                </p>
                <h6 className="fw-bold mb-2" style={{ fontSize: "1rem", lineHeight: "1.4" }}>
                  {p.tenSanPham}
                </h6>

                {/* Giá */}
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  {p.giaGoc && p.giaGoc > p.giaBan && (
                    <span className="text-muted small text-decoration-line-through">
                      {p.giaGoc.toLocaleString()} ₫
                    </span>
                  )}
                  <span className="text-danger fw-bold fs-4">
                    {p.giaBan.toLocaleString()} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}