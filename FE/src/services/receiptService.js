const API_URL = "http://localhost:8081/receipts";
const PRODUCT_URL = "http://localhost:8081/products";
const SUPPLIER_URL = "http://localhost:8081/suppliers"; // ✅ thêm đường dẫn nhà cung cấp

export async function fetchReceipts() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Không thể tải danh sách phiếu nhập");
  return res.json();
}

export async function createReceipt(data, id = null) {
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Không thể lưu phiếu nhập");
  return res.json();
}

export async function deleteReceipt(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Không thể xóa phiếu nhập");
}

export async function fetchProducts() {
  const res = await fetch(PRODUCT_URL);
  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json();
}

export async function fetchSuppliers() {
  const res = await fetch(SUPPLIER_URL);
  if (!res.ok) throw new Error("Không thể tải danh sách nhà cung cấp");
  return res.json();
}
