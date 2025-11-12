// src/services/warehouseService.js
import { apiGet } from "./apiClient";

export const getWarehouseItems = () => apiGet("/warehouse");

export const searchWarehouseByName = (keyword) =>
  apiGet(`/warehouse/search-by-name?keyword=${encodeURIComponent(keyword)}`);
