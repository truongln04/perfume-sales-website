// src/pages/client/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/Client/ProductCard"; // đường dẫn tuỳ dự án

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [related, setRelated] = useState([]);

  // 

  // lấy sản phẩm hiện tại + giỏ hàng
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8081/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch(() => setProduct(null));

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
        .then((cart) => setCartCount(cart.chiTietGioHang?.length || 0))
        .catch(() => setCartCount(0));
    }
  }, [id]);

  // khi product thay đổi thì lọc sản phẩm liên quan
  useEffect(() => {
    if (!product) return;
    fetch("http://localhost:8081/products/active")
      .then((res) => res.json())
      .then((allProducts) => {
        // Lọc theo cả danh mục và thương hiệu
        const relatedProducts = allProducts.filter(
          (p) =>
            p.idSanPham !== product.idSanPham &&
            p.idDanhMuc === product.idDanhMuc &&
            p.tenthuonghieu === product.tenthuonghieu
        );

        setRelated(relatedProducts);
      });
  }, [product]);


  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thêm giỏ hàng");
      return;
    }
    if (!product || product.soLuongTon === 0) {
      alert("Sản phẩm đã hết hàng, không thể thêm vào giỏ.");
      return;
    }

    try {
      const userRes = await fetch("http://localhost:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await userRes.json();

      // Lấy giỏ hàng hiện tại
      const cartRes = await fetch(`http://localhost:8081/cart/${user.idTaiKhoan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cart = await cartRes.json();

      // Tìm sản phẩm trong giỏ
      const existingItem = cart.chiTietGioHang?.find(
        (item) => item.idSanPham === product.idSanPham
      );

      const currentQty = existingItem ? existingItem.soLuong : 0;
      const totalQty = currentQty + quantity;

      if (totalQty > product.soLuongTon) {
        alert(
          `Số lượng vượt quá tồn kho (${product.soLuongTon}). ` +
          `Trong giỏ đã có ${currentQty}, bạn chỉ có thể thêm tối đa ${product.soLuongTon - currentQty}.`
        );
        return;
      }

      const finalPrice =
        product.kmPhanTram > 0
          ? Math.round(product.giaBan * (1 - product.kmPhanTram / 100))
          : product.giaBan;

      const res = await fetch("http://localhost:8081/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idTaiKhoan: user.idTaiKhoan,
          chiTietGioHang: [
            {
              idSanPham: product.idSanPham,
              soLuong: quantity,
              donGia: finalPrice,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Thêm giỏ hàng thất bại");
      await res.json();

      alert("Đã thêm vào giỏ hàng thành công!");
      const isNewProduct = !existingItem;
      const newTotalItems =
        (cart.chiTietGioHang?.length || 0) + (isNewProduct ? 1 : 0);

      // Gửi lên navbar
      window.dispatchEvent(
        new CustomEvent("cart-updated", { detail: newTotalItems })
      );
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
      {/* Chi tiết sản phẩm */}
      <div className="row g-5 mb-5">
        <div className="col-md-5">
          <div className="border rounded shadow-sm p-3 bg-white text-center position-relative">
            <img
              src={product.hinhAnh || "/placeholder.jpg"}
              alt={product.tenSanPham}
              className="img-fluid"
              style={{ maxHeight: "350px", objectFit: "contain" }}
              loading="lazy"
            />
            {product.kmPhanTram > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                -{product.kmPhanTram}%
              </span>
            )}
          </div>
        </div>

        <div className="col-md-7">
          <h3 className="fw-bold mb-3">{product.tenSanPham}</h3>
          <p><strong>Loại:</strong> {product.tenDanhMuc || "—"}</p>
          <p><strong>Thương hiệu:</strong> {product.tenthuonghieu || "ORCHARD"}</p>
          <p><strong>Tồn kho:</strong> {product.soLuongTon ?? 0} sản phẩm</p>

          <div className="mb-4">
            <span className="text-danger fw-bold fs-4">
              {(
                product.kmPhanTram > 0
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
              className="btn btn-primary btn-lg fw-bold rounded-pill shadow-sm flex-grow-1"
              onClick={handleAddToCart}
            >
              🛒 Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* Mô tả */}
      <div className="row mb-5">
        <div className="col-12">
          <h5 className="fw-bold mb-3">Mô tả</h5>
          <div className="border rounded p-3 bg-light" style={{ minHeight: "200px", whiteSpace: "pre-line" }}>
            {product.moTa || "Chưa có mô tả cho sản phẩm này."}
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      <div className="row">
        <h5 className="fw-bold mb-3">Sản phẩm liên quan</h5>
        <div className="row row-cols-1 row-cols-md-5 g-4">
          {related.length === 0 ? (
            <p className="text-muted">Chưa có sản phẩm liên quan.</p>
          ) : (
            related.map((item) => (
              <div className="col mb-4" key={item.idSanPham}>
                <ProductCard product={item} />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
