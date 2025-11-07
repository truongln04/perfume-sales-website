import { useState, useEffect, useMemo } from "react";
import BrandManager from "../../components/BrandManager";
import {
  getBrands,
  searchBrands,
  deleteBrand,
  saveBrand
} from "../../services/brandService";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", country: "", logo: "" });

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value.trim()) {
      fetchBrands();
      return;
    }
    try {
      const data = await searchBrands(value);
      setBrands(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const filtered = useMemo(() => {
    return [...brands].sort((a, b) => a.id - b.id);
  }, [brands]);

  const onAdd = () => {
    setEditing(null);
    setForm({ id: "", name: "", country: "", logo: "" });
    setShowModal(true);
  };

  const onEdit = (brand) => {
    setEditing(brand);
    setForm({ ...brand });
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (window.confirm("Xóa thương hiệu này?")) {
      try {
        await deleteBrand(id);
        fetchBrands();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên thương hiệu");
      return;
    }

    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      logo: form.logo.trim(),
    };

    try {
      await saveBrand(payload, editing?.id);
      setShowModal(false);
      setEditing(null);
      fetchBrands();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <BrandManager
      brands={filtered}
      search={search}
      onSearch={handleSearch}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      showModal={showModal}
      setShowModal={setShowModal}
      form={form}
      onChange={handleChange}
      onSave={onSave}
      editing={editing}
    />
  );
}
