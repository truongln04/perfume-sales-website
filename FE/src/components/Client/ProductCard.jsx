// src/components/ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const giaSauKm =
    product.giaBan && product.kmPhanTram
      ? Math.round(product.giaBan * (1 - product.kmPhanTram / 100))
      : product.giaBan;

  return (
    <Link
      to={`/client/products/${product.idSanPham}`}
      className="card h-100 text-center text-decoration-none text-dark position-relative shadow-sm"
      style={{
        opacity: 0.95,
        transform: "scale(0.95)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Ảnh + badge */}
      <div
        className="bg-white overflow-hidden position-relative"
        style={{
          height: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
        }}
      >
        {product.kmPhanTram > 0 && (
          <span
            className="badge bg-danger position-absolute top-0 start-0 m-2"
            style={{ zIndex: 2 }}
          >
            -{product.kmPhanTram}%
          </span>
        )}
        <img
          src={product.hinhAnh || "/placeholder.jpg"}
          alt={product.tenSanPham}
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

      {/* Thông tin */}
      <div className="card-body p-2">
        <p className="text-muted small mb-1 fw-medium text-uppercase">
          {product.tenThuongHieu || "ORCHARD"}
        </p>
        <h6 className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
          {product.tenSanPham}
        </h6>

        <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
          <span className="text-danger fw-bold fs-6">
            {giaSauKm?.toLocaleString()} ₫
          </span>
          {product.kmPhanTram > 0 && (
            <span className="text-muted small text-decoration-line-through">
              {product.giaBan?.toLocaleString()} ₫
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
