import { useState, useEffect, useMemo } from "react";
import ProductManager from "../../components/ProductManager";
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
    giaNhap: 0,         // 👈 Thêm dòng này
    soLuongTon: 0       // 👈 Và dòng này
  };
}


  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("❌ Failed to fetch products", err);
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
    setShowModal(true);
  };

  const onEdit = (product) => {
    setEditing(product);
    setForm({ ...product });
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
    if (
      !form.tenSanPham.trim() ||
      form.idDanhMuc === "" ||
      form.idthuonghieu === "" ||
      !form.hinhAnh.trim()
    ) {
      alert("Vui lòng nhập đầy đủ Tên sản phẩm, Danh mục, Thương hiệu và Hình ảnh");
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
  giaNhap: form.giaNhap ?? 0,         // 👈 Luôn gửi
  soLuongTon: form.soLuongTon ?? 0    // 👈 Luôn gửi
};


    if (editing) {
      payload.giaNhap = form.giaNhap;
      payload.soLuongTon = form.soLuongTon;
    }

    console.log("📦 Payload gửi lên:", payload);

    try {
      await saveProduct(payload, editing?.idSanPham);
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
    const numericFields = ["giaBan", "kmPhanTram"];

    const newValue =
      type === "checkbox"
        ? checked
        : numericFields.includes(name)
        ? value === "" ? "" : Number(value)
        : value;

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
    />
  );
}
