// src/services/productService.js
import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export const getProducts = () => apiGet("/products");

export const searchProducts = (keyword) =>
  apiGet(`/products/search?keyword=${encodeURIComponent(keyword)}`);

export const deleteProduct = (id) => apiDelete(`/products/${id}`);

export const saveProduct = (product, editingId) => {
  const url = editingId ? `/products/${editingId}` : "/products";

  return editingId
    ? apiPut(url, product, true)  // gửi kèm token
    : apiPost(url, product, true); // gửi kèm token
};

export const fetchDanhMucs = () => apiGet("/categories");

export const fetchThuongHieus = () => apiGet("/brands");

export const fetchNhaCungCaps = () => apiGet("/suppliers");
