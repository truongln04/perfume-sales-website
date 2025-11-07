// src/services/productService.js

const API_URL = "http://localhost:8081/products";

export const getProducts = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const searchProducts = async (keyword) => {
  const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
  return res.json();
};

export const deleteProduct = async (id) => {
  return fetch(`${API_URL}/${id}`, { method: "DELETE" });
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
