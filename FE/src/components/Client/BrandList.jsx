import { useEffect, useState } from "react";
import axios from "axios";

export default function BrandList() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // lấy token từ localStorage

    axios.get("http://localhost:8081/api/brands", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setBrands(res.data))
    .catch(err => {
      console.error("Lỗi khi lấy thương hiệu:", err);
      setBrands([]);
    });
  }, []);

  return (
    <div className="container py-4">
      <h5 className="fw-bold">Thương hiệu</h5>
      <div className="d-flex flex-wrap gap-3">
        {Array.isArray(brands) && brands.map(brand => (
          <button key={brand.id} className="btn btn-outline-secondary">
            {brand.tenThuongHieu}
          </button>
        ))}
      </div>
    </div>
  );
}
