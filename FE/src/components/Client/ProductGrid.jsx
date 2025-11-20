import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductGrid() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({}); // { categoryId: [products] }
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Lấy danh sách tất cả danh mục
    axios
      .get("http://localhost:8081/categories", { headers })
      .then((res) => {
        const cats = res.data || [];
        setCategories(cats);
        setLoadingCategories(false);

        // 2. Với từng danh mục → lấy sản phẩm bằng endpoint chuẩn
        cats.forEach((cat) => {
          axios
            .get(`http://localhost:8081/categories/${cat.idDanhMuc || cat.id}/products`, {
              headers,
              params: { size: 20 }, // lấy tối đa 20 sản phẩm mỗi danh mục (giống trang chủ)
            })
            .then((prodRes) => {
              const products = prodRes.data.content || prodRes.data || [];
              setProductsByCategory((prev) => ({
                ...prev,
                [cat.idDanhMuc || cat.id]: products.slice(0, 20), // đảm bảo không quá 20
              }));
            })
            .catch((err) => {
              console.error(`Lỗi load sản phẩm danh mục ${cat.tenDanhMuc}:`, err);
              setProductsByCategory((prev) => ({
                ...prev,
                [cat.idDanhMuc || cat.id]: [],
              }));
            });
        });
      })
      .catch((err) => {
        console.error("Lỗi load danh mục:", err);
        setCategories([]);
        setLoadingCategories(false);
      });
  }, []);

  // Hiển thị loading nếu chưa có danh mục
  if (loadingCategories) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {categories.map((cat) => {
        const catId = cat.idDanhMuc || cat.id;
        const products = productsByCategory[catId] || [];

        // Ẩn section nếu chưa load xong hoặc không có sản phẩm
        if (!products.length && productsByCategory.hasOwnProperty(catId)) {
          return null; // hoặc có thể hiển thị "Chưa có sản phẩm"
        }

        return (
          <section key={catId} className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold fs-3 text-dark">{cat.tenDanhMuc}</h2>
              <Link
                to={`/client/category/${catId}`}
                className="text-primary text-decoration-none fw-medium fs-5 hover-underline"
              >
                Xem thêm ›
              </Link>
            </div>

            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4 px-2">
              {products.map((p) => {
                const giaSauKm = p.kmPhanTram > 0
                  ? Math.round(p.giaBan * (1 - p.kmPhanTram / 100))
                  : p.giaBan;

                const coQuaTang = p.quaTang || p.coQuaTang || false;
                const giaTriQuaTang = p.giaTriQuaTang || "299k";

                return (
                  <div className="col" key={p.idSanPham}>
                    <Link
                      to={`/client/product/${p.idSanPham}`}
                      className="text-decoration-none text-dark d-block"
                    >
                      <div className="rounded-4 overflow-hidden bg-white shadow-sm position-relative hover-shadow-lg transition-all">
                        {/* Badge khuyến mãi */}
                        {p.kmPhanTram > 0 && (
                          <span className="badge bg-danger position-absolute top-0 start-0 m-2 z-10">
                            -{p.kmPhanTram}%
                          </span>
                        )}

                        {/* Badge quà tặng */}
                        {coQuaTang && (
                          <div className="position-absolute top-0 start-50 translate-middle-x z-10">
                            <span className="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill shadow-sm">
                              QUÀ TẶNG {giaTriQuaTang}
                            </span>
                          </div>
                        )}

                        {/* Ảnh sản phẩm */}
                        <div
                          className="bg-light"
                          style={{ height: "240px", padding: "20px" }}
                        >
                          <img
                            src={p.hinhAnh || p.anhSanPham || "/placeholder.jpg"}
                            alt={p.tenSanPham}
                            className="w-100 h-100"
                            style={{ objectFit: "contain" }}
                            loading="lazy"
                          />
                        </div>

                        {/* Thông tin */}
                        <div className="p-3 text-center">
                          <p className="text-muted small text-uppercase fw-medium mb-1">
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
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}