import { useEffect, useState } from "react";
import axios from "axios";

export default function BrandList() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8081/brands", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setBrands(res.data.slice(0, 10))) // lấy tối đa 10 thương hiệu
      .catch(() => setBrands([]));
  }, []);

  return (
    <div className="d-flex flex-wrap justify-content-center gap-5 mb-5">
      {brands.map((brand) => (
        <div key={brand.idThuongHieu} className="text-center">
          <div
            className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm mx-auto mb-3"
            style={{
              width: "130px",
              height: "130px",
              border: "1px solid #eee",
            }}
          >
            <img
              src={brand.logo || "/placeholder-brand.png"}
              alt={brand.tenThuongHieu}
              className="img-fluid rounded-circle"
              style={{ width: "90px", height: "90px", objectFit: "contain" }}
            />
          </div>
          <p className="mb-0 fw-medium text-dark" style={{ fontSize: "0.95rem" }}>
            {brand.tenThuongHieu}
          </p>
        </div>
      ))}
    </div>
  );
}