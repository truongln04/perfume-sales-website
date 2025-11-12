// src/services/productService.js
import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export const getProducts = () => apiGet("/products");

export const searchProducts = (keyword) =>
  apiGet(`/products/search?keyword=${encodeURIComponent(keyword)}`);

export const deleteProduct = (id) => apiDelete(`/products/${id}`);

export const saveProduct = (product, editingId) => {
  return editingId
    ? apiPut(`/products/${editingId}`, product)
    : apiPost("/products", product);
};

export const fetchDanhMucs = () => apiGet("/categories");

export const fetchThuongHieus = () => apiGet("/brands");
