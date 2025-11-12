const API_URL = "http://localhost:8081/products";
const DANH_MUC_API = "http://localhost:8081/categories";
const THUONG_HIEU_API = "http://localhost:8081/brands";

// Lấy token từ localStorage và tạo header Authorization
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔹 Lấy tất cả sản phẩm
export const getProducts = async () => {
  const res = await fetch(API_URL, {
    headers: {
      ...getAuthHeader(), // ✅ bỏ Content-Type trong GET
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi fetch products: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
};

// 🔹 Tìm kiếm sản phẩm
export const searchProducts = async (keyword) => {
  const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi tìm kiếm sản phẩm: ${res.status}`);
  }

  return res.json();
};

// 🔹 Xóa sản phẩm
export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi xóa sản phẩm: ${res.status}`);
  }

  return res;
};

// 🔹 Thêm hoặc cập nhật sản phẩm
export const saveProduct = async (product, editingId) => {
  const url = editingId ? `${API_URL}/${editingId}` : API_URL;
  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi lưu sản phẩm: ${res.status}`);
  }

  return res;
};

// 🔹 Lấy tất cả danh mục
export const fetchDanhMucs = async () => {
  const res = await fetch(DANH_MUC_API, {
    headers: {
      ...getAuthHeader(), // ✅ bỏ Content-Type trong GET
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi lấy danh mục: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
};

// 🔹 Lấy tất cả thương hiệu
export const fetchThuongHieus = async () => {
  const res = await fetch(THUONG_HIEU_API, {
    headers: {
      ...getAuthHeader(), // ✅ bỏ Content-Type trong GET
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi lấy thương hiệu: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
};
