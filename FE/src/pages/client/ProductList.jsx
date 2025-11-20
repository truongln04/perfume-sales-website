import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductsList({ categoryId, title, linkText }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8081/products?category=${categoryId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [categoryId]);

  return (
    <section className="container py-5 my-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
         <h2 className="fw-bold mb-4">Tất cả sản phẩm</h2>
      </div>

      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4 px-2">
  {products.map((p) => {
    const giaSauKm =
      p.giaBan && p.kmPhanTram
        ? Math.round(p.giaBan * (1 - p.kmPhanTram / 100))
        : p.giaBan;

    return (
      <div className="col" key={p.idSanPham}>
        <Link
          to={`/client/product/${p.idSanPham}`}
          className="card h-100 text-center text-decoration-none text-dark position-relative"
          style={{
            opacity: 0.95,          // mờ nhẹ
            transform: "scale(0.95)", // thu nhỏ card
            transition: "all 0.3s ease",
          }}
        >
          {/* Container ảnh + badge */}
          <div
            className="bg-white overflow-hidden position-relative"
            style={{
              height: "240px", // thu nhỏ chiều cao ảnh
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0",
            }}
          >
            {p.kmPhanTram > 0 && (
              <span
                className="badge bg-danger position-absolute top-0 start-0 m-2"
                style={{ zIndex: 2 }}
              >
                -{p.kmPhanTram}%
              </span>
            )}
            <img
              src={p.hinhAnh || "/placeholder.jpg"}
              alt={p.tenSanPham}
              className="img-fluid"
              style={{
                maxHeight: "100%",
                width: "auto",
                objectFit: "contain",
                zIndex: 1,
              }}
              loading="lazy"
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div className="card-body p-2">
            <p className="text-muted small mb-1 fw-medium text-uppercase">
              {p.tenThuongHieu || p.thuongHieu || "ORCHARD"}
            </p>
            <h6 className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
              {p.tenSanPham}
            </h6>

            <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
              <span className="text-danger fw-bold fs-6">
                {giaSauKm?.toLocaleString()} ₫
              </span>
              {p.kmPhanTram > 0 && (
                <span className="text-muted small text-decoration-line-through">
                  {p.giaBan?.toLocaleString()} ₫
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  })}
</div>

    </section>
  );
}
