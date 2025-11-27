import { useState, useMemo, useEffect } from "react";
import ProductManager from "../../components/admin/ProductManager";
import Pagination from "../../components/Common/Pagination"; // import phân trang
import {
  getProducts,
  searchProducts,
  deleteProduct,
  saveProduct,
  fetchDanhMucs,
  fetchThuongHieus,
} from "../../services/productService";

function emptyProduct() {
  return {
    idSanPham: "",
    tenSanPham: "",
    moTa: "",
    hinhAnh: "",
    idDanhMuc: "",
    idthuonghieu: "",
    giaBan: "",
    kmPhanTram: "",
    trangThai: false,
    giaNhap: 0,
    soLuongTon: 0,
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [danhMucs, setDanhMucs] = useState([]);
  const [thuongHieus, setThuongHieus] = useState([]);
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Gộp lỗi + thông báo thành công – giống hệt Brands.jsx
  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      showMessage("Lỗi tải danh sách sản phẩm", "error");
    }
  };

  const loadMeta = async () => {
    try {
      const [dmList, thList] = await Promise.all([
        fetchDanhMucs(),
        fetchThuongHieus(),
      ]);
      setDanhMucs(dmList);
      setThuongHieus(thList);
    } catch (err) {
      showMessage("Lỗi tải danh mục/thương hiệu", "error");
    }
  };

  useEffect(() => {
    fetchProducts();
    loadMeta();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    setCurrentPage(1); // reset về trang 1 khi tìm kiếm
    if (!value.trim()) {
      fetchProducts();
      return;
    }
    try {
      const data = await searchProducts(value);
      setProducts(data);
    } catch (err) {
      showMessage("Lỗi tìm kiếm", "error");
    }
  };

  const filtered = useMemo(() => {
    return [...products].sort((a, b) => (a.idSanPham || 0) - (b.idSanPham || 0));
  }, [products]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyProduct());
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (product) => {
    setEditing(product);
    setForm({
      ...product,
      giaBan: product.giaBan || "",
      kmPhanTram: product.kmPhanTram || "",
    });
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onDelete = async (idSanPham) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      const res = await deleteProduct(idSanPham);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Không thể xóa");
      }
      fetchProducts();
      showMessage("Xóa sản phẩm thành công!");
    } catch (err) {
      showMessage(err.message || "Lỗi khi xóa sản phẩm", "error");
    }
  };

  // GIỐNG HỆT BRANDS.JSX – CHUẨN HOÀN HẢO!
  const onSave = async () => {
    // 1. Validate nhanh ở frontend (UX tốt)
    if (!form.tenSanPham?.trim()) return showMessage("Vui lòng nhập tên sản phẩm", "error");
    if (!form.moTa?.trim()) return showMessage("Vui lòng nhập mô tả sản phẩm", "error");
    if (!form.hinhAnh?.trim()) return showMessage("Vui lòng nhập URL hình ảnh sản phẩm", "error");
    if (!form.idDanhMuc) return showMessage("Vui lòng chọn danh mục", "error");
    if (!form.idthuonghieu) return showMessage("Vui lòng chọn thương hiệu", "error");
    

    const payload = {
      tenSanPham: form.tenSanPham.trim(),
      moTa: form.moTa.trim(),
      hinhAnh: form.hinhAnh.trim(),
      idDanhMuc: Number(form.idDanhMuc),
      idthuonghieu: Number(form.idthuonghieu),
      giaBan: Number(form.giaBan),
      kmPhanTram: form.kmPhanTram ? Number(form.kmPhanTram) : 0,
      trangThai: Boolean(form.trangThai),
      giaNhap: form.giaNhap || 0,
      soLuongTon: form.soLuongTon || 0,
    };

    try {
      const res = await fetch(
        editing ? `http://localhost:8081/products/${editing.idSanPham}` : "http://localhost:8081/products",
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lưu sản phẩm thất bại");
      }

      // Thành công
      setProducts((prev) =>
        editing
          ? prev.map((p) => (p.idSanPham === data.idSanPham ? data : p))
          : [...prev, data]
      );

      setShowModal(false);
      showMessage(
        editing ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!"
      );
    } catch (err) {
      // Lỗi chi tiết từ backend
      showMessage(err.message || "Lỗi khi lưu sản phẩm", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numericFields = ["giaBan", "kmPhanTram", "giaNhap", "soLuongTon"];

    let newValue =
      type === "checkbox"
        ? checked
        : numericFields.includes(name)
        ? value === "" ? "" : Number(value)
        : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (message.text) setMessage({ text: "", type: "" });
  };

   // tính tổng số trang
  const totalPages = Math.ceil(filtered.length / pageSize);

  // cắt dữ liệu theo trang
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
      <>
    <ProductManager
      // products={filtered}
      products={paginatedProducts} // chỉ truyền dữ liệu theo trang
      search={search}
      onSearch={handleSearch}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      showModal={showModal}
      setShowModal={setShowModal}
      form={form}
      setForm={setForm}
      onSave={onSave}
      editing={editing}
      handleChange={handleChange}
      danhMucs={danhMucs}
      thuongHieus={thuongHieus}
      message={message}
    />

    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      variant="admin"
    />
  </>
  );
}