// src/services/productService.js

// src/services/productService.js
const API_URL = "http://localhost:8081/products";

// Lấy token từ localStorage và tạo header Authorization
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async () => {
  const res = await fetch(API_URL, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),  // gắn token
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi fetch products: ${res.status}`);
  }

  const data = await res.json();

  // Nếu backend trả về object { data: [...] } thì parse ra array
  return Array.isArray(data) ? data : data.data || [];
};


export const searchProducts = async (keyword) => {
  const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
    headers: getAuthHeader(),
  });
  return res.json();
};

export const deleteProduct = async (id) => {
  return fetch(`${API_URL}/${id}`, { method: "DELETE", headers: getAuthHeader() });
};

export const saveProduct = async (product, editingId) => {
  const url = editingId ? `${API_URL}/${editingId}` : API_URL;
  const method = editingId ? "PUT" : "POST";

  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
};
