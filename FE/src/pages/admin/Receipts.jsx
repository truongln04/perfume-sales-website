import { useState, useEffect, useMemo } from "react";
import ReceiptManager from "../../components/receiptManager";
import {
  fetchReceipts,
  createReceipt,
  deleteReceipt,
  fetchProducts,
  fetchSuppliers,
} from "../../services/receiptService";

export default function Receipt() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyReceipt());

  function emptyReceipt() {
    return {
      idPhieuNhap: null,
      idNcc: "",
      ngayNhap: new Date().toISOString().slice(0, 10),
      ghiChu: "",
      details: [{ idSanPham: "", soLuong: 1, donGia: 0 }],
      tongTien: 0,
    };
  }

  function calculateTotal(details) {
    return details.reduce((sum, d) => sum + d.soLuong * d.donGia, 0);
  }

  const loadData = async () => {
    try {
      const [r, p, s] = await Promise.all([
        fetchReceipts(),
        fetchProducts(),
        fetchSuppliers(),
      ]);
      setReceipts(r);
      setProducts(p);
      setSuppliers(s);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      tongTien: calculateTotal(prev.details),
    }));
  }, [form.details]);

const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  if (!q) return receipts;
  return receipts.filter(
    r =>
      r.idPhieuNhap?.toString().includes(q) ||
      r.tenNhaCungCap?.toLowerCase().includes(q) ||
      r.nhaCungCap?.tenNhaCungCap?.toLowerCase().includes(q)
  );
}, [receipts, search]);


  const onAdd = () => {
    setEditing(null);
    setForm(emptyReceipt());
    setShowModal(true);
  };

const onEdit = (receipt) => {
  setEditing(receipt);
  setForm({
    idPhieuNhap: receipt.idPhieuNhap,
    idNcc: receipt.idNcc || receipt.nhaCungCap?.idNcc || "",
    ngayNhap: receipt.ngayNhap?.slice(0, 10),
    ghiChu: receipt.ghiChu || "",
    details: receipt.chiTietPhieuNhap.map(d => ({
      idSanPham: d.idSanPham || d.sanPham?.idSanPham || "",
      soLuong: d.soLuong,
      donGia: d.donGia,
    })),
    tongTien: receipt.tongTien,
  });
  setShowModal(true);
};


  const onDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phiếu nhập này?")) {
      try {
        await deleteReceipt(id);
        loadData();
      } catch (err) {
        console.error("Xóa thất bại:", err);
      }
    }
  };

  const onSave = async () => {
    if (!form.idNcc) {
      alert("Vui lòng chọn nhà cung cấp");
      return;
    }

    const payload = {
      idNcc: Number(form.idNcc),
      ngayNhap: form.ngayNhap,
      ghiChu: form.ghiChu.trim(),
      tongTien: calculateTotal(form.details),
      chiTietPhieuNhap: form.details.map(d => ({
        idSanPham: Number(d.idSanPham),
        soLuong: Number(d.soLuong),
        donGia: Number(d.donGia),
      })),
    };

    try {
      await createReceipt(payload, form.idPhieuNhap); // dùng idPhieuNhap để xác định sửa
      setShowModal(false);
      setEditing(null);
      loadData();
    } catch (err) {
      console.error("Lưu thất bại:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.details];
      updated[index][field] = Number(value);
      return { ...prev, details: updated };
    });
  };

  const handleAddDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { idSanPham: "", soLuong: 1, donGia: 0 }],
    }));
  };

  const handleRemoveDetail = (index) => {
    setForm(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  return (
    <ReceiptManager
      receipts={filtered}
      products={products}
      suppliers={suppliers}
      search={search}
      onSearch={setSearch}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      showModal={showModal}
      form={form}
      editing={editing}
      onChange={handleChange}
      onDetailChange={handleDetailChange}
      onAddDetail={handleAddDetail}
      onRemoveDetail={handleRemoveDetail}
      onSave={onSave}
      onClose={() => setShowModal(false)}
    />
  );
}
