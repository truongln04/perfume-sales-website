// src/services/brandService.js
import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export const getBrands = () => apiGet("/brands");

export const searchBrands = (name) =>
  apiGet(`/brands/search/name?name=${encodeURIComponent(name)}`);

export const deleteBrand = (id) => apiDelete(`/brands/${id}`);

export const saveBrand = (brand, editingId) => {
  return editingId
    ? apiPut(`/brands/${editingId}`, brand)
    : apiPost("/brands", brand);
};
