import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8081/products")
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setProducts([]);
      });
  }, []);

  return (
    <div className="container py-4">
      <h5 className="fw-bold">Sản phẩm nổi bật</h5>
      <div className="row g-4">
        {Array.isArray(products) && products.map(p => (
          <div className="col-md-3" key={p.id}>
            <div className="card h-100">
              <img src={p.hinhAnh} className="card-img-top" alt={p.tenSanPham} />
              <div className="card-body">
                <h6 className="card-title">{p.tenSanPham}</h6>
                <p className="text-danger fw-bold">{p.gia.toLocaleString()} ₫</p>
                <a href={`/products/${p.id}`} className="btn btn-outline-dark w-100">Xem chi tiết</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
