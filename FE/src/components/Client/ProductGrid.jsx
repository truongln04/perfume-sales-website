import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../../components/Client/ProductCard"; // tái sử dụng card

export default function ProductGrid() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get("http://localhost:8081/categories", { headers })
      .then((res) => {
        const cats = res.data || [];
        setCategories(cats);
        setLoadingCategories(false);

        cats.forEach((cat) => {
          axios
            .get(`http://localhost:8081/categories/${cat.idDanhMuc || cat.id}/products`, {
              headers,
              params: { size: 20 },
            })
            .then((prodRes) => {
              const products = prodRes.data.content || prodRes.data || [];
              setProductsByCategory((prev) => ({
                ...prev,
                [cat.idDanhMuc || cat.id]: products.slice(0, 20),
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

        if (!products.length && productsByCategory.hasOwnProperty(catId)) {
          return null;
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
              {products.map((p) => (
                <div className="col" key={p.idSanPham}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
