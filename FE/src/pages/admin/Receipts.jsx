import { useState, useEffect, useMemo } from "react";
import ReceiptManager from "../../components/admin/receiptManager";
import {
  fetchReceipts,
  searchReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  fetchProducts,
  fetchSuppliers,
} from "../../services/receiptService";

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

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyReceipt());
  const [viewing, setViewing] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "" });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

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
      showMessage("Lỗi tải dữ liệu", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSearch = async (value) => {
  setSearch(value);

  const keyword = value.trim();
  if (!keyword) {
    loadData(); // return all receipts
    return;
  }

  try {
    const result = await searchReceipts(keyword);
    setReceipts(result); // ghi đè danh sách
  } catch (err) {
    showMessage(err.message, "error");
  }
};

  // const filtered = useMemo(() => {
  //   const q = search.trim().toLowerCase();
  //   if (!q) return receipts;
  //   return receipts.filter(
  //     (r) =>
  //       r.idPhieuNhap?.toString().includes(q) ||
  //       r.tenNhaCungCap?.toLowerCase().includes(q)
  //   );
  // }, [receipts, search]);

  const calculateTotal = (details) =>
    details.reduce((sum, d) => sum + (Number(d.soLuong) || 0) * (Number(d.donGia) || 0), 0);

  // ================== ACTIONS ==================

  const onAdd = () => {
    setEditing(null);
    setForm(emptyReceipt());
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (receipt) => {
    const selectedNcc = suppliers.find(
      (s) => String(s.idNcc) === String(receipt.idNcc)
    );

    setEditing(receipt);
    setForm({
      idPhieuNhap: receipt.idPhieuNhap,
      idNcc: selectedNcc?.idNcc || "",
      tenNcc: selectedNcc?.tenNcc || receipt.tenNhaCungCap || "",
      ngayNhap: receipt.ngayNhap?.slice(0, 10) || "",
      ghiChu: receipt.ghiChu || "",
     details: receipt.chiTietPhieuNhap.map((d) => ({
      idSanPham: d.idSanPham,
      tenSanPham: d.tenSanPham || products.find((p) => Number(p.idSanPham) === Number(d.idSanPham))?.tenSanPham || "",
      soLuong: d.soLuong,
      donGia: d.donGia, // Lấy trực tiếp từ ReceiptDetail
    })),
  });
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

const onDelete = async (id) => {
  if (!window.confirm("Bạn có chắc muốn xóa phiếu nhập này?")) return;

  try {
    await deleteReceipt(id);
    loadData();
    showMessage("Xóa phiếu nhập thành công!", "success");
  } catch (err) {
    console.error("Delete error:", err); // log ra console để kiểm tra

    // lấy message từ backend nếu có
    const errorMsg =
      err.response?.data?.message ||
      err.message ||
      "Không thể xóa phiếu nhập (có thể đã bán hàng)";

    showMessage(errorMsg, "error");
  }
};

  const onSave = async () => {
    // VALIDATE
    if (!form.details || form.details.length === 0)
      return showMessage("Phiếu nhập phải có ít nhất 1 sản phẩm", "error");

    for (let i = 0; i < form.details.length; i++) {
      const d = form.details[i];
      if (!d.idSanPham) return showMessage(`Vui lòng chọn sản phẩm`, "error");
      if (!d.soLuong || d.soLuong <= 0)
        return showMessage(`Số lượng phải > 0`, "error");
      if (!d.donGia || d.donGia <= 0)
        return showMessage(`Đơn giá phải > 0`, "error");
    }

    if (form.ghiChu?.trim().length > 500)
      return showMessage("Ghi chú không vượt quá 500 ký tự", "error");

    const payload = {
      idNcc: Number(form.idNcc),
      ghiChu: form.ghiChu?.trim() || null,
      chiTietPhieuNhap: form.details.map((d) => ({
        idSanPham: Number(d.idSanPham),
        soLuong: Number(d.soLuong),
        donGia: Number(d.donGia),
      })),
    };

    try {
      if (editing) await updateReceipt(editing.idPhieuNhap, payload);
      else await createReceipt(payload);

      setEditing(null);
      setShowModal(false);
      loadData();
      showMessage(editing ? "Cập nhật phiếu nhập thành công!" : "Thêm phiếu nhập thành công!");
    } catch (err) {
      showMessage(err.response?.data?.message || "Lỗi khi lưu phiếu nhập", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "idNcc") {
      const selected = suppliers.find((s) => Number(s.idNcc) === Number(value));
      setForm((prev) => ({
        ...prev,
        idNcc: Number(value),
        tenNcc: selected?.tenNcc || "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleDetailChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.details];
      updated[index][field] =
        field === "soLuong" || field === "donGia" ? Number(value) || 0 : value;
      return { ...prev, details: updated };
    });
  };

  const handleAddDetail = () => {
    setForm((prev) => ({
      ...prev,
      details: [...prev.details, { idSanPham: "", tenSanPham: "", soLuong: 1, donGia: 0 }],
    }));
  };

  const handleRemoveDetail = (index) => {
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  // ================== RENDER ==================
  return (
    <ReceiptManager
      receipts={receipts}
      products={products}
      suppliers={suppliers}
      search={search}
      onSearch={onSearch}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      showModal={showModal}
      setShowModal={setShowModal}
      form={form}
      onSave={onSave}
      editing={editing}
      handleChange={handleChange}
      onDetailChange={handleDetailChange}
      onAddDetail={handleAddDetail}
      onRemoveDetail={handleRemoveDetail}
      onClose={() => {
        setShowModal(false);
        setMessage({ text: "", type: "" });
      }}
      selectedReceipt={viewing}
      onView={(receipt) => {
        const enriched = {
          ...receipt,
          chiTietPhieuNhap: receipt.chiTietPhieuNhap.map((item) => {
            const product = products.find(
              (p) => Number(p.idSanPham) === Number(item.idSanPham)
            );
            return {
              ...item,
               tenSanPham: item.tenSanPham || product?.tenSanPham || "Không rõ",
        donGia: item.donGia,
            };
          }),
        };
        setViewing(enriched);
      }}
      onCloseView={() => setViewing(null)}
      message={message}
    />
  );
}
