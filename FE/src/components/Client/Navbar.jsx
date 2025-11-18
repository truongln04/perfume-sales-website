import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8081/categories") // hoặc URL backend của bạn
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error("Lỗi khi lấy danh mục:", err);
        setCategories([]);
      });
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm">
      <div className="container">
        <a className="navbar-brand fw-bold text-dark" href="/">NƯỚC HOA</a>
        <ul className="navbar-nav me-auto">
          {Array.isArray(categories) && categories.map(cat => (
            <li className="nav-item" key={cat.id}>
              <a className="nav-link" href={`/category/${cat.id}`}>{cat.tenDanhMuc}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
