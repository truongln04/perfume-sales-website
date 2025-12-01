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
  const [listMessage, setListMessage] = useState({ text: "", type: "" });
const [modalMessage, setModalMessage] = useState({ text: "", type: "" });

    const showListMessage = (text, type = "success") => {
  setListMessage({ text, type });
  setTimeout(() => setListMessage({ text: "", type: "" }), 3000);
};

const showModalMessage = (text, type = "error") => {
  setModalMessage({ text, type });
  setTimeout(() => setModalMessage({ text: "", type: "" }), 3000);
};

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      showListMessage("Lỗi tải danh sách sản phẩm", "error");
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
      showListMessage("Lỗi tải danh mục/thương hiệu", "error");
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
      showListMessage("Lỗi tìm kiếm", "error");
    }
  };

  const filtered = useMemo(() => {
    return [...products].sort((a, b) => (a.idSanPham || 0) - (b.idSanPham || 0));
  }, [products]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyProduct());
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (product) => {
    setEditing(product);
    setForm({
      ...product,
      giaBan: product.giaBan || "",
      kmPhanTram: product.kmPhanTram || "",
    });
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onDelete = async (idSanPham) => {
  if (!window.confirm("Xóa sản phẩm này?")) return;

  try {
    await deleteProduct(idSanPham);
    fetchProducts();
    showListMessage("Xóa sản phẩm thành công!", "success");
  } catch (err) {
    console.error("Delete product error:", err);

    // lấy message từ backend nếu có
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error   || // phòng trường hợp backend trả về error
      err.message ||
      "Không thể xóa sản phẩm (có thể đã liên quan đến đơn hàng)";

    showListMessage(errorMsg, "error");
  }
};


  // GIỐNG HỆT BRANDS.JSX – CHUẨN HOÀN HẢO!
  const onSave = async () => {
    // 1. Validate nhanh ở frontend (UX tốt)
    if (!form.tenSanPham?.trim()) return showModalMessage("Vui lòng nhập tên sản phẩm", "error");
    if (!form.moTa?.trim()) return showModalMessage("Vui lòng nhập mô tả sản phẩm", "error");
    if (!form.hinhAnh?.trim()) return showModalMessage("Vui lòng nhập URL hình ảnh sản phẩm", "error");
    if (!form.idDanhMuc) return showModalMessage("Vui lòng chọn danh mục", "error");
    if (!form.idthuonghieu) return showModalMessage("Vui lòng chọn thương hiệu", "error");
    

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
      showListMessage(
        editing ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!"
      );
    } catch (err) {
      // Lỗi chi tiết từ backend
      showModalMessage(err.message || "Lỗi khi lưu sản phẩm", "error");
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
    if (message.text) setModalMessage({ text: "", type: "" });
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
      listMessage={listMessage}
      modalMessage={modalMessage}
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