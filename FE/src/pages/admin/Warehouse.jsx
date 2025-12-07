import { useEffect, useState } from "react";
import WarehouseManager from "../../components/admin/WarehouseManager";
import {
  getWarehouseItems,
  searchWarehouseByName,
} from "../../services/warehouseService";

export default function WarehousePage() {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [lowStockWarnings, setLowStockWarnings] = useState([]); // cảnh báo tồn kho < 10

  const processData = (data) => {
    const updated = data.map(item => ({
      ...item,
      tonKhoHienTai: (item.soLuongNhap || 0) - (item.soLuongBan || 0),
      tenSanPham: item.tenSanPham || "N/A" // lấy tên sản phẩm từ quan hệ
    }));

    const lowStock = updated.filter(item => item.tonKhoHienTai < 10);

    setItems(updated);
    setLowStockWarnings(lowStock);
  };

  const fetchData = async () => {
    try {
      const data = await getWarehouseItems();
      processData(data);
    } catch (err) {
      console.error("Lỗi khi tải kho:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (value) => {
    setKeyword(value);
    try {
      if (!value.trim()) {
        fetchData();
      } else {
        const data = await searchWarehouseByName(value);
        processData(data);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
    }
  };

  return (
    <>
      {/* Cảnh báo tồn kho thấp */}
     {lowStockWarnings.length > 0 && (
  <div className="alert alert-danger d-flex align-items-start gap-3 mb-4 p-3" role="alert"
       style={{ borderLeft: "6px solid #b30000", background: "#ffe6e6" }}>
    
    {/* Icon cảnh báo đỏ */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="currentColor"
      className="text-danger"
      viewBox="0 0 16 16"
    >
      <path d="M7.938 2.016A1.5 1.5 0 0 1 9.44 3.1l6.293 10.9c.55.953-.066 2.1-1.22 2.1H1.487c-1.154 0-1.77-1.147-1.22-2.1L6.56 3.1a1.5 1.5 0 0 1 1.379-.884zM8 5a.905.905 0 0 0-.9.9v3.6a.9.9 0 1 0 1.8 0V5.9A.905.905 0 0 0 8 5zm0 8a1.05 1.05 0 1 0 0-2.1 1.05 1.05 0 0 0 0 2.1z"/>
    </svg>

    {/* Nội dung cảnh báo */}
    <div>
      <strong className="text-danger fs-6">Cảnh báo tồn kho thấp!</strong>
      <p className="m-0 mt-1 text-danger">
        Có <strong>{lowStockWarnings.length}</strong> sản phẩm dưới mức tồn kho cho phép:
      </p>

      <ul className="mt-2 mb-0">
        {lowStockWarnings.map((item) => (
          <li key={item.idSanPham} className="text-danger">
            {item.tenSanPham} – còn <strong>{item.tonKhoHienTai}</strong> sản phẩm
          </li>
        ))}
      </ul>
    </div>
  </div>
)}


      <WarehouseManager
        items={items}
        keyword={keyword}
        onSearch={handleSearch}
      />
    </>
  );
}