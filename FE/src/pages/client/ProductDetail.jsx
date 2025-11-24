import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0); // số sản phẩm trong giỏ

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

    // Lấy số lượng giỏ hàng hiện tại
    if (token) {
      fetch("http://localhost:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) =>
          fetch(`http://localhost:8081/cart/${user.idTaiKhoan}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
        .then((res) => res.json())
        .then((cart) => setCartCount(cart.length))
        .catch(() => setCartCount(0));
    }
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm giỏ hàng");
      return;
    }

    // kiểm tra tồn kho
    if (!product || product.soLuongTon === 0) {
      alert("Sản phẩm đã hết hàng, không thể thêm vào giỏ.");
      return;
    }
    if (quantity > product.soLuongTon) {
      alert(`Số lượng vượt quá tồn kho (${product.soLuongTon}).`);
      return;
    }

    try {
      // lấy user id
      const userRes = await fetch("http://localhost:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await userRes.json();

      // giá sau khuyến mãi
      const finalPrice =
        product.kmPhanTram && product.kmPhanTram > 0
          ? Math.round(product.giaBan * (1 - product.kmPhanTram / 100))
          : product.giaBan;

      // gọi API thêm giỏ hàng
      const res = await fetch("http://localhost:8081/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idTaiKhoan: user.idTaiKhoan,
          idSanPham: product.idSanPham,
          soLuong: quantity,
          donGia: finalPrice,
        }),
      });

      if (!res.ok) throw new Error("Thêm giỏ hàng thất bại");
      await res.json();

      alert("Đã thêm vào giỏ hàng thành công!");

      // cập nhật số lượng giỏ hàng chính xác
      const updatedCartRes = await fetch(`http://localhost:8081/cart/${user.idTaiKhoan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Thông báo giỏ hàng cần refresh lại số lượng (không set cứng về 0 nữa)
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: "refresh" }));
      
    } catch (err) {
      console.error("Lỗi khi thêm giỏ hàng:", err);
      alert("Có lỗi xảy ra khi thêm giỏ hàng");
    }
  };




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
              )?.toLocaleString()}{" "}
              ₫
            </span>

            {product.kmPhanTram > 0 && (
              <span className="text-muted ms-3 text-decoration-line-through">
                {product.giaBan?.toLocaleString()} ₫
              </span>
            )}
          </div>

          {/* Số lượng + nút thêm giỏ */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <label>Số lượng:</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-control w-25"
            />
            <button
              className="btn btn-dark flex-grow-1"
              onClick={handleAddToCart}
            >
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
