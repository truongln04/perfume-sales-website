import { useEffect, useState } from "react";
import axios from "axios";
import '../../index.css';

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

  return (
    <section className="container py-5 bg-light">
      <h2 className="text-center fw-bold mb-4" style={{ fontSize: "2rem" }}>
        Thương hiệu nổi bật
      </h2>
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-5 py-4">
        {brands.map((brand) => (
          <a
            key={brand.idThuongHieu || brand.tenThuongHieu}
            href={`/client/brand/${brand.idThuongHieu || brand.tenThuongHieu}`}
            className="d-block"
            title={`Nước hoa ${brand.tenThuongHieu}`}
          >
            <img
              src={
                brand.logo ||
                `/images/brands/${brand.tenThuongHieu
                  .toLowerCase()
                  .replace(/\s+/g, '-')}.png`
              }
              alt={`Logo thương hiệu ${brand.tenThuongHieu}`}
              style={{ height: "55px", objectFit: "contain" }}
              className="opacity-75 hover-opacity-100 transition"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
