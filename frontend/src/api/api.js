import axios from "axios";

// In production (Vercel), VITE_API_URL is set to the Railway backend URL.
// In development, it falls back to localhost.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = () => API.get("/products/");
export const addProduct = (data) => API.post("/products/", data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const restockProduct = (id, quantity_added) => API.patch(`/products/${id}/restock`, { quantity_added });

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const getSuppliers = () => API.get("/suppliers/");
export const addSupplier = (data) => API.post("/suppliers/", data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// ── Sales ─────────────────────────────────────────────────────────────────────
export const getSales = () => API.get("/sales/");
export const recordSale = (data) => API.post("/sales/", data);

// ── Invoices ──────────────────────────────────────────────────────────────────
export const downloadInvoice = (saleId) => API.get(`/invoices/${saleId}`, { responseType: "blob" });

// ── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions = () => API.get("/transactions/");

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => API.get("/dashboard/");

// ── Reports ───────────────────────────────────────────────────────────────────
export const getCategoryStockReport = () => API.get("/reports/category-stock");
export const getLowStockReport = () => API.get("/reports/low-stock");
export const getProfitSummary = () => API.get("/reports/profit-summary");
export const getInsights = () => API.get("/reports/insights");
