import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8081/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return <div className="container py-5">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="container py-5">
      {/* Hàng 1: ảnh + thông tin */}
      <div className="row g-5 mb-5">
        {/* Ảnh sản phẩm */}
        <div className="col-md-5">
          <div className="border rounded shadow-sm p-3 bg-white text-center position-relative">
            <img
              src={product.hinhAnh || "/placeholder.jpg"}
              alt={product.tenSanPham}
              className="img-fluid"
              style={{ maxHeight: "350px", objectFit: "contain" }}
              loading="lazy"
            />
            {product.kmPhanTram && (
              <span
                className="badge bg-danger position-absolute top-0 start-0 m-2"
                style={{ fontSize: "0.9rem" }}
              >
                -{product.kmPhanTram}% 
              </span>
            )}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="col-md-7">
          <h3 className="fw-bold mb-3">{product.tenSanPham}</h3>
          <p className="mb-2">
            <strong>Loại:</strong> {product.tenDanhMuc || "—"}
          </p>
          <p className="mb-2">
            <strong>Thương hiệu:</strong>{" "}
            {product.tenThuongHieu || product.tenthuonghieu || "ORCHARD"}
          </p>
          <p className="mb-2">
            <strong>Tồn kho:</strong> {product.soLuongTon ?? 0} sản phẩm
          </p>

          {/* Giá sau khuyến mãi */}
<div className="mb-4">
  <span className="text-danger fw-bold fs-4">
    {(
      product.giaBan &&
      product.kmPhanTram
        ? Math.round(product.giaBan * (1 - product.kmPhanTram / 100))
        : product.giaBan
    )?.toLocaleString()} ₫
  </span>

  {product.kmPhanTram > 0 && (
    <span className="text-muted ms-3 text-decoration-line-through">
      {product.giaBan?.toLocaleString()} ₫
    </span>
  )}
</div>


          {/* Số lượng + nút thêm giỏ */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-control w-25"
            />
            <button className="btn btn-dark flex-grow-1">
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Hàng 2: mô tả */}
      <div className="row">
        <div className="col-12">
          <h5 className="fw-bold mb-3">Mô tả</h5>
          <div
            className="border rounded p-3 bg-light"
            style={{ minHeight: "200px", whiteSpace: "pre-line" }}
          >
            {product.moTa || "Chưa có mô tả cho sản phẩm này."}
          </div>
        </div>
      </div>
    </div>
  );
}
