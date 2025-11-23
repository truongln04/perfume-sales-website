import { useState, useEffect, useMemo } from "react";
import ReceiptManager from "../../components/admin/receiptManager";
import {
  fetchReceipts,
  createReceipt,
  updateReceipt,
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
  const [viewing, setViewing] = useState(null);

  function emptyReceipt() {
    return {
      idPhieuNhap: null,
      idNcc: "",
      tenNcc: "",
      ngayNhap: new Date().toISOString().slice(0, 10),
      ghiChu: "",
      details: [{ idSanPham: "", tenSanPham: "", soLuong: 1, donGia: 0 }],
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
  const selectedNcc =
    suppliers.find(s => s.idNcc === receipt.idNcc) ||
    suppliers.find(s => s.tenNcc === receipt.tenNhaCungCap);

  setEditing(receipt);
  setForm({
    idPhieuNhap: receipt.idPhieuNhap,
    idNcc: selectedNcc?.idNcc || "",
    tenNcc: selectedNcc?.tenNcc || receipt.tenNhaCungCap || "",
    ngayNhap: receipt.ngayNhap?.slice(0, 10),
    ghiChu: receipt.ghiChu || "",
    details: receipt.chiTietPhieuNhap.map(d => {
      const selectedProduct =
        products.find(p => p.idSanPham === d.idSanPham) ||
        products.find(p => p.tenSanPham === d.tenSanPham);
      return {
        idSanPham: selectedProduct?.idSanPham || d.idSanPham,
        tenSanPham: selectedProduct?.tenSanPham || d.tenSanPham || "",
        soLuong: d.soLuong,
        donGia: d.donGia,
      };
    }),
  });
  setShowModal(true);
};


const onDelete = async (id) => {
  if (!window.confirm("⚠️ Bạn có chắc muốn xóa phiếu nhập này?")) return;

  try {
    await deleteReceipt(id);
    alert("✅ Xóa phiếu nhập thành công!");
    loadData();
  } catch (err) {
    console.error("Xóa thất bại:", err);
    alert(err.message); // ✅ giờ sẽ hiện đúng message từ backend
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
  chiTietPhieuNhap: form.details.map(d => ({
    idSanPham: Number(d.idSanPham),
    soLuong: Number(d.soLuong),
    donGia: parseFloat(d.donGia),   // ✅ ép về số thập phân
  })),
};
 // ✅ Thêm log ở đây để kiểm tra payload
  console.log("📤 Payload gửi lên:", JSON.stringify(payload, null, 2));
    try {
      if (form.idPhieuNhap) {
        await updateReceipt(form.idPhieuNhap, payload); // sửa
      } else {
        await createReceipt(payload); // thêm mới
      }

      setEditing(null);
      setShowModal(false);
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
      updated[index][field] =
        field === "soLuong" || field === "donGia" ? Number(value) : value;
      return { ...prev, details: updated };
    });
  };

  const handleAddDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { idSanPham: "", tenSanPham: "", soLuong: 1, donGia: 0 }],
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
      selectedReceipt={viewing}
      onView={(receipt) => {
        const enriched = {
          ...receipt,
          chiTietPhieuNhap: receipt.chiTietPhieuNhap.map((item) => {
            const product = products.find(p => p.idSanPham === Number(item.idSanPham));
            return {
              ...item,
              tenSanPham: product?.tenSanPham || item.tenSanPham || "Không rõ tên sản phẩm",
            };
          }),
        };
        setViewing(enriched);
      }}
      onCloseView={() => setViewing(null)}
    />
  );
}
