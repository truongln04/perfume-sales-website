import { useEffect, useState } from "react";
import axios from "axios";
import '../../index.css';
import { Link } from "react-router-dom";

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get("http://localhost:8081/brands", { headers })
      .then((res) => setBrands(res.data))
      .catch((err) => {
        console.error("Lỗi tải thương hiệu:", err);
        setBrands([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-5">Đang tải thương hiệu...</div>;
  }
  console.log("Danh sách brands nhận được:", brands);

  return (
    <section className="container py-5 bg-light">
      <h2 className="text-center fw-bold mb-4" style={{ fontSize: "2rem" }}>
        Thương hiệu nổi bật
      </h2>
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-5 py-4">
        {brands.map((brand) => (
          <Link
            key={brand.idthuonghieu}
            to={`/client/brand/${brand.idthuonghieu}`}
            className="d-block"
            title={`Nước hoa ${brand.tenthuonghieu}`}
          >
            <img
              src={
                brand.logo ||
                `/images/brands/${brand.tenthuonghieu
                  .toLowerCase()
                  .replace(/\s+/g, '-')}.png`
              }
              alt={`Logo thương hiệu ${brand.tenthuonghieu}`}
              style={{ height: "55px", objectFit: "contain" }}
              className="opacity-75 hover-opacity-100 transition"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}