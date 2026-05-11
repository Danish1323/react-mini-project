import axios from "axios";

// Base URL for the FastAPI backend
const API = axios.create({
  baseURL: "http://localhost:8000",
});

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = () => API.get("/products/");
export const addProduct = (data) => API.post("/products/", data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const getSuppliers = () => API.get("/suppliers/");
export const addSupplier = (data) => API.post("/suppliers/", data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// ── Sales ─────────────────────────────────────────────────────────────────────
export const getSales = () => API.get("/sales/");
export const recordSale = (data) => API.post("/sales/", data);

// ── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions = () => API.get("/transactions/");

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => API.get("/dashboard/");

// ── Reports ───────────────────────────────────────────────────────────────────
export const getCategoryStockReport = () => API.get("/reports/category-stock");
export const getLowStockReport = () => API.get("/reports/low-stock");
export const getProfitSummary = () => API.get("/reports/profit-summary");
