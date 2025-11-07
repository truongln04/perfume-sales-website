
const API_URL = "http://localhost:8081/brands";

export const getBrands = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const searchBrands = async (name) => {
  const res = await fetch(`${API_URL}/search/name?name=${encodeURIComponent(name)}`);
  return res.json();
};

export const deleteBrand = async (id) => {
  return fetch(`${API_URL}/${id}`, { method: "DELETE" });
};

export const saveBrand = async (brand, editingId) => {
  const url = editingId ? `${API_URL}/${editingId}` : API_URL;
  const method = editingId ? "PUT" : "POST";

  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brand),
  });
};
