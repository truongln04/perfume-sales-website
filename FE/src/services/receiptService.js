const API_URL = "http://localhost:8081/receipts";
const PRODUCT_URL = "http://localhost:8081/products";
const SUPPLIER_URL = "http://localhost:8081/suppliers";

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy danh sách phiếu nhập
export async function fetchReceipts() {
  const res = await fetch(API_URL, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Không thể tải danh sách phiếu nhập");
  return res.json();
}

// Tìm kiếm phiếu nhập
export async function searchReceipts(keyword) {
  const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message = errorData?.message || "Không thể tìm kiếm phiếu nhập";
    throw new Error(message);
  }

  return res.json();
}

// Thêm mới phiếu nhập
export async function createReceipt(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể tạo phiếu nhập");
  return res.json();
}

// Sửa phiếu nhập
export async function updateReceipt(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể cập nhật phiếu nhập");
  return res.json();
}

// Xóa phiếu nhập
export async function deleteReceipt(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    // ✅ lấy message từ backend
    const errorData = await res.json().catch(() => null);
    const message = errorData?.message || "Không thể xóa phiếu nhập";
    throw new Error(message);
  }
}


// Lấy danh sách sản phẩm
export async function fetchProducts() {
  const res = await fetch(PRODUCT_URL, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json();
}

// Lấy danh sách nhà cung cấp
export async function fetchSuppliers() {
  const res = await fetch(SUPPLIER_URL, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Không thể tải danh sách nhà cung cấp");
  return res.json();
}
