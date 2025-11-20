import { useEffect, useState } from "react";
import axios from "axios";
import '../../index.css';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // Lấy động từ backend
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Lấy 5 danh mục chính (có thể tạo endpoint riêng hoặc filter)
    Promise.all([
      axios.get("http://localhost:8081/categories", { headers }),
      axios.get("http://localhost:8081/brands", { headers }) // Nếu bạn đã có API này
      // Nếu chưa có API /brands, dùng cách dưới cùng phần chú thích
    ])
      .then(([catRes, brandRes]) => {
        // Chỉ lấy đúng 5 danh mục đầu (hoặc theo thứ tự backend quy định)
        setCategories(catRes.data.slice(0, 5));

        // Lấy danh sách thương hiệu
        setBrands(brandRes.data);
      })
      .catch((err) => {
        console.error("Lỗi tải dữ liệu:", err);
        setCategories([]);
        setBrands([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 5 ảnh polaroid siêu đẹp cố định (từ Imgur - miễn phí, ổn định, đẹp đúng chuẩn Orchard)
  const polaroidImages = [
    "https://orchard.vn/wp-content/uploads/2024/07/category-nuoc-hoa-niche-600x720.webp",  // Niche - sang trọng
    "https://orchard.vn/wp-content/uploads/2024/07/category-nuoc-hoa-nam.webp",  // Nam - mạnh mẽ
    "https://orchard.vn/wp-content/uploads/2024/07/category-nuoc-hoa-nu-600x720.webp",  // Nữ - nữ tính
    "https://orchard.vn/wp-content/uploads/2024/07/category-nuoc-hoa-mini-600x720.webp",  // Mini - dễ thương
    "https://orchard.vn/wp-content/uploads/2024/07/category-nuoc-hoa-unisex-600x720.webp",  // Unisex - hiện đại
  ];

  if (loading) {
    return <div className="text-center py-5">Đang tải danh mục...</div>;
  }

  return (
    <>
      {/* ============== 5 Ô DANH MỤC POLAROID  ============== */}
      <section className="container py-5">
        <div className="row g-4 justify-content-center">
          {categories.map((cat, index) => (
            <div className="col-6 col-md-4 col-lg-2" key={cat.idDanhMuc}>
              <div className="text-center">
                <a href={`/client/category/${cat.idDanhMuc}`}>
                  <div
                    className="category-polaroid mx-auto mb-3 position-relative overflow-hidden shadow-lg hover-lift"
                    style={{
                      width: "260px",
                      height: "300px",
                      background: "#fff",
                      padding: "20px 15px 50px",
                      transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`,
                      boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <img
                      src={polaroidImages[index] || "/placeholder.jpg"}
                      alt={cat.tenDanhMuc}
                      className="w-100 h-100"
                      style={{ objectFit: "cover", borderRadius: "10px" }}
                      loading="lazy"
                    />
                    <div
                      className="position-absolute bottom-0 start-50 translate-middle-x text-center bg-white w-100 py-3 border-top"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: "700",
                        fontSize: "1.3rem",
                        letterSpacing: "1px",
                        color: "#333",
                      }}
                    >
                      {cat.tenDanhMuc.toUpperCase()}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== DANH SÁCH THƯƠNG HIỆU – LẤY ĐỘNG ============== */}
      {brands.length > 0 && (
        <section className="container py-5 bg-light">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-5 py-4">
            {brands.map((brand) => (
              <img
                key={brand.idThuongHieu || brand.tenThuongHieu}
                src={brand.logo || `/images/brands/${brand.tenThuongHieu.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={brand.tenThuongHieu}
                style={{ height: "45px", objectFit: "contain" }}
                className="opacity-70 hover-opacity-100 transition"
                title={brand.tenThuongHieu}
              />
            ))}
          </div>
        </section>
      )}

      {/* ============== NƯỚC HOA NỮ – vẫn giữ nguyên hoặc làm động sau ============== */}
      <section className="container py-5 my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-light" style={{ fontSize: "2rem", letterSpacing: "2px" }}>
            Nước hoa Nữ
          </h2>
          <a href="/client/category/3" className="text-dark text-decoration-none fw-medium">
            Xem thêm nước hoa nữ ›
          </a>
        </div>

        {/* Ở đây bạn sẽ chèn <ProductGridFemale /> hoặc component sản phẩm nữ */}
      </section>
    </>
  );
}