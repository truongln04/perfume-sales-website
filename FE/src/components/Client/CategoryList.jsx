import { useEffect, useState } from "react";
import axios from "axios";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // lấy token sau khi login

    axios.get("http://localhost:8081/api/categories", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setCategories(res.data))
    .catch(err => {
      console.error("Lỗi khi lấy danh mục:", err);
      setCategories([]);
    });
  }, []);

  return (
    <div className="container py-4">
      <h5 className="fw-bold">Danh mục</h5>
      <div className="d-flex flex-wrap gap-3">
        {Array.isArray(categories) && categories.map(cat => (
          <button key={cat.id} className="btn btn-outline-dark">
            {cat.tenDanhMuc}
          </button>
        ))}
      </div>
    </div>
  );
}
