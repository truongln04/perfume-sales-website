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
  fetchNhaCungCaps,
} from "../../services/productService";
import { fetchReceipts } from "../../services/receiptService";

function emptyProduct() {
  return {
    idSanPham: "",
    tenSanPham: "",
    moTa: "",
    hinhAnh: "",
    idDanhMuc: "",
    idthuonghieu: "",
    idNcc: "",
    giaBan: "",
    kmPhanTram: "",
    trangThai: false,
    giaNhap: "",
    soLuongTon: 0,
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]); 
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [danhMucs, setDanhMucs] = useState([]);
  const [thuongHieus, setThuongHieus] = useState([]);
  const [nhaCungCaps, setNhaCungCaps] = useState([]);
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
      const [dmList, thList, nccList] = await Promise.all([
        fetchDanhMucs(),
        fetchThuongHieus(),
        fetchNhaCungCaps(),
      ]);
      setDanhMucs(dmList);
      setThuongHieus(thList);
      setNhaCungCaps(nccList);
    } catch (err) {
      showListMessage("Lỗi tải danh mục/thương hiệu/nhà cung cấp", "error");
    }
  };

  const loadReceipts = async () => {
    try {
      const data = await fetchReceipts();
      console.log("Receipts:", data);
      setReceipts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadMeta();
    loadReceipts();
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

  // ================== TÍNH GIA NHẬP ==================
  const enrichedProducts = useMemo(() => {
  return products.map(product => {
    // Lấy tất cả chi tiết phiếu nhập liên quan đến sản phẩm
    const details = receipts.flatMap(r =>
      r.chiTietPhieuNhap.map(d => ({
        ...d,
        ngayNhap: r.ngayNhap
      }))
    );

    // Lọc chi tiết của sản phẩm hiện tại
    const productDetails = details.filter(d => Number(d.idSanPham) === Number(product.idSanPham));

    // Lấy chi tiết mới nhất
    const lastDetail = productDetails.sort((a, b) => new Date(b.ngayNhap) - new Date(a.ngayNhap))[0];

    return {
      ...product,
      giaNhap: lastDetail ? Number(lastDetail.donGia) : 0
    };
  });
}, [products, receipts]);


  const filtered = useMemo(() => {
    return [...enrichedProducts].sort((a, b) => (a.idSanPham || 0) - (b.idSanPham || 0));
  }, [enrichedProducts]);

  const onAdd = () => {
    setEditing(null);
    setForm({
    ...emptyProduct(),
    giaNhap: 0
  });
    setModalMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const onEdit = (product) => {
    const enriched = enrichedProducts.find(p => p.idSanPham === product.idSanPham);
    setEditing(product);
    setForm({
      ...product,
      giaBan: product.giaBan || "",
      kmPhanTram: product.kmPhanTram || "",
      giaNhap: enriched.giaNhap || 0,
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
    if (!form.idNcc) return showModalMessage("Vui lòng chọn nhà cung cấp", "error");
    

    const payload = {
      tenSanPham: form.tenSanPham.trim(),
      moTa: form.moTa.trim(),
      hinhAnh: form.hinhAnh.trim(),
      idDanhMuc: Number(form.idDanhMuc),
      idthuonghieu: Number(form.idthuonghieu),
      idNcc: Number(form.idNcc),
      giaBan: Number(form.giaBan),
      kmPhanTram: form.kmPhanTram ? Number(form.kmPhanTram) : 0,
      trangThai: Boolean(form.trangThai),
      giaNhap: form.giaNhap || 0,
      soLuongTon: form.soLuongTon || 0,
    };
//  console.log("Payload gửi lên:", payload);
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

  // reset thông báo lỗi trong modal khi người dùng thay đổi input
  if (modalMessage.text) setModalMessage({ text: "", type: "" });
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
      nhaCungCaps={nhaCungCaps}
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