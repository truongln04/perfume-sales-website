import { useState, useEffect, useMemo } from "react";
import ProductManager from "../../components/ProductManager";
import {
  getProducts,
  searchProducts,
  deleteProduct,
  saveProduct
} from "../../services/productService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());

  function emptyProduct() {
    return {
      tenSanPham: "",
      moTa: "",
      hinhAnh: "",
      idDanhMuc: "",
      idThuongHieu: "",
      giaNhap: 0,
      giaBan: 0,
      kmPhanTram: 0,
      soLuongTon: 0,
      trangThai: true,
    };
  }

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
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
      console.error("Search failed", err);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      p =>
        p.tenSanPham?.toLowerCase().includes(q) ||
        p.idDanhMuc?.toString().includes(q) ||
        p.idThuongHieu?.toString().includes(q)
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
    if (window.confirm("Xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const onSave = async () => {
    if (!form.tenSanPham.trim()) {
      alert("Vui lòng nhập Tên sản phẩm");
      return;
    }

    const payload = {
      tenSanPham: form.tenSanPham.trim(),
      moTa: form.moTa.trim(),
      hinhAnh: form.hinhAnh.trim(),
      idDanhMuc: Number(form.idDanhMuc),
      idThuongHieu: Number(form.idThuongHieu),
      giaNhap: Number(form.giaNhap),
      giaBan: Number(form.giaBan),
      kmPhanTram: Number(form.kmPhanTram),
      soLuongTon: Number(form.soLuongTon),
      trangThai: form.soLuongTon > 0,
    };

    try {
      await saveProduct(payload, editing?.idSanPham);
      setShowModal(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["giaBan", "giaNhap", "kmPhanTram", "soLuongTon", "idDanhMuc", "idThuongHieu"];
    const newValue = numericFields.includes(name) ? Number(value) : value;

    setForm(prev => ({
      ...prev,
      [name]: newValue,
      trangThai: prev.soLuongTon > 0,
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
    />
  );
}
