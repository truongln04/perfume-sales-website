// src/services/clientService.js
const BASE_URL = "http://localhost:8081";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiGet = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
};

export const apiPut = async (path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
};

export const apiDelete = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res;
};
