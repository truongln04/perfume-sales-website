import { useState, useEffect, useMemo } from "react";
import ProductManager from "../../components/admin/ProductManager";
import {
  getProducts,
  searchProducts,
  deleteProduct,
  saveProduct,
  fetchDanhMucs,
  fetchThuongHieus,
} from "../../services/productService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [danhMucs, setDanhMucs] = useState([]);
  const [thuongHieus, setThuongHieus] = useState([]);
  const [error, setError] = useState(""); // ✅ lưu lỗi

  function emptyProduct() {
    return {
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

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("❌ Lỗi không thể tải danh sách", err);
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
      console.error("❌ Failed to fetch metadata", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadMeta();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchProducts();
      return;
    }
    try {
      const data = await searchProducts(value);
      setProducts(data);
    } catch (err) {
      console.error("❌ Search failed", err);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.tenSanPham?.toLowerCase().includes(q) ||
        p.tenDanhMuc?.toLowerCase().includes(q) ||
        p.tenthuonghieu?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const onAdd = () => {
    setEditing(null);
    setForm(emptyProduct());
    setError("");
    setShowModal(true);
  };

  const onEdit = (p) => {
    setForm({
      ...p,
      previewImage: p.hinhAnh?.startsWith("data:image")
        ? p.hinhAnh
        : p.hinhAnh?.startsWith("http")
        ? p.hinhAnh
        : p.hinhAnh
        ? `/images/${p.hinhAnh}`
        : "",
    });
    setEditing(p);
    setError("");
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error("❌ Delete failed", err);
      }
    }
  };

  const onSave = async () => {
    // ✅ validate cơ bản
    if (
      !form.tenSanPham.trim() ||
      form.idDanhMuc === "" ||
      form.idthuonghieu === "" ||
      !form.hinhAnh.trim() ||
      !form.moTa.trim()
    ) {
      setError("Vui lòng nhập đầy đủ Tên sản phẩm, Danh mục, Thương hiệu, Mô tả, Hình ảnh");
      return;
    }

    // ✅ kiểm tra giá bán âm
    if (form.giaBan < 0) {
      setError("Giá bán không được âm!");
      return;
    }

    // ✅ kiểm tra trạng thái
    if (form.trangThai && (!form.giaBan || form.giaBan <= 0)) {
      setError("Phải nhập giá bán hợp lệ trước khi chuyển sang trạng thái Đang bán!");
      return;
    }

    const payload = {
      tenSanPham: form.tenSanPham.trim(),
      moTa: form.moTa.trim(),
      hinhAnh: form.hinhAnh.trim(),
      idDanhMuc: Number(form.idDanhMuc),
      idthuonghieu: Number(form.idthuonghieu),
      giaBan: form.giaBan !== "" && form.giaBan != null ? Number(form.giaBan) : 0,
      kmPhanTram: form.kmPhanTram !== "" && form.kmPhanTram != null ? Number(form.kmPhanTram) : 0,
      trangThai: Boolean(form.trangThai),
      giaNhap: form.giaNhap ?? 0,
      soLuongTon: form.soLuongTon ?? 0,
    };

    try {
      if (editing) {
        await saveProduct(payload, editing.idSanPham);
      } else {
        await saveProduct(payload);
      }

      alert(editing ? "✅ Sửa sản phẩm thành công!" : "✅ Thêm sản phẩm thành công!");
      setShowModal(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error("❌ Save failed", err.response?.data || err.message);
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

    // ✅ kiểm tra giá bán âm khi nhập
    if (name === "giaBan" && newValue < 0) {
      console.error("❌ Giá bán không được âm");
      setError("Giá bán không được âm!");
      return;
    }

    setError("");
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <ProductManager
      products={filtered}
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
      error={error} // ✅ truyền lỗi xuống GUI
    />
  );
}
