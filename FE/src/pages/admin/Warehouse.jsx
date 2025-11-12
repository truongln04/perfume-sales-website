// src/pages/WarehousePage.jsx
import { useEffect, useState } from "react";
import WarehouseManager from "../../components/WarehouseManager";
import {
  getWarehouseItems,
  searchWarehouseByName,
} from "../../services/warehouseService";

export default function WarehousePage() {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");

  const fetchData = async () => {
    try {
      const data = await getWarehouseItems();
      setItems(data);
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
        setItems(data);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
    }
  };

  return (
    <WarehouseManager
      items={items}
      keyword={keyword}
      onSearch={handleSearch}
    />
  );
}
