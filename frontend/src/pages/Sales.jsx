import { useState, useEffect } from "react";
import { getSales, recordSale, getProducts } from "../api/api";
import { ShoppingCart, Plus, FileDown, CheckCircle, AlertTriangle, X } from "lucide-react";
import axios from "axios";

function Sales() {
  const [sales, setSales]         = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [message, setMessage]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState({ product_id: "", quantity_sold: "" });

  useEffect(() => { loadData(); }, []);

  function loadData() {
    setLoading(true);
    Promise.all([getSales(), getProducts()])
      .then(([sRes, pRes]) => {
        setSales(sRes.data);
        setProducts(pRes.data);
      })
      .catch(() => showMsg("Failed to load data.", "error"))
      .finally(() => setLoading(false));
  }

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleRecord(e) {
    e.preventDefault();

    const qty = parseInt(form.quantity_sold);
    const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));

    // Client-side guard: cannot sell more than available stock
    if (selectedProduct && qty > selectedProduct.quantity) {
      showMsg(`Only ${selectedProduct.quantity} unit(s) available in stock.`, "error");
      return;
    }
    if (qty <= 0) {
      showMsg("Quantity must be at least 1.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await recordSale({
        product_id: parseInt(form.product_id),
        quantity_sold: qty,
      });
      showMsg("Sale recorded successfully.");
      setForm({ product_id: "", quantity_sold: "" });
      setShowForm(false);
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.detail || "Sale failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Download PDF invoice for a sale
  async function downloadInvoice(saleId) {
    try {
      const res = await axios.get(`http://localhost:8000/invoices/${saleId}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${saleId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showMsg("Could not generate invoice. Check backend.", "error");
    }
  }

  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));
  const qty = parseInt(form.quantity_sold) || 0;
  const previewRevenue = selectedProduct ? (selectedProduct.selling_price * qty).toFixed(2) : "—";
  const previewProfit  = selectedProduct ? ((selectedProduct.selling_price - selectedProduct.cost_price) * qty).toFixed(2) : "—";

  const totalRevenue = sales.reduce((s, x) => s + x.total_sale_amount, 0);
  const totalProfit  = sales.reduce((s, x) => s + x.total_profit, 0);

  if (loading) return <div className="loading"><ShoppingCart size={16} /> Loading sales...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Sales</h1>
          <p>
            {sales.length} transactions · Revenue ₹{totalRevenue.toFixed(2)} · Profit ₹{totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancel" : "Record Sale"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {message.text}
        </div>
      )}

      {/* Record Sale Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <h2><Plus size={14} /> New Sale</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleRecord}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="form-group">
                  <label>Product *</label>
                  <select
                    required
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value, quantity_sold: "" })}
                  >
                    <option value="">— Select a product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} {p.quantity === 0 ? "(Out of stock)" : `(Stock: ${p.quantity})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || undefined}
                    required
                    value={form.quantity_sold}
                    onChange={(e) => setForm({ ...form, quantity_sold: e.target.value })}
                    placeholder={selectedProduct ? `Max: ${selectedProduct.quantity}` : ""}
                  />
                </div>
              </div>

              {/* Preview */}
              {selectedProduct && form.quantity_sold && qty > 0 && (
                <div className="preview-box">
                  <span>Sell price: <strong>₹{selectedProduct.selling_price}/unit</strong></span>
                  <span>Revenue: <strong>₹{previewRevenue}</strong></span>
                  <span>Profit: <strong>₹{previewProfit}</strong></span>
                  {qty > selectedProduct.quantity && (
                    <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                      Exceeds stock ({selectedProduct.quantity})
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || (selectedProduct && qty > selectedProduct.quantity)}
              >
                {submitting ? "Recording..." : "Confirm Sale"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="card">
        <div className="card-header">
          <h2><ShoppingCart size={14} /> Sales History</h2>
          <span className="card-count">{sales.length}</span>
        </div>
        <div className="table-wrap">
          {sales.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={36} />
              <p>No sales recorded yet</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Sell Price</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Date</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[...sales].reverse().map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 11 }}>#{s.id}</td>
                    <td><strong>{s.product?.name || `Product #${s.product_id}`}</strong></td>
                    <td>{s.quantity_sold}</td>
                    <td>₹{s.selling_price_at_sale}</td>
                    <td style={{ fontWeight: 600, color: "var(--info)" }}>₹{s.total_sale_amount.toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: "var(--success)" }}>₹{s.total_profit.toFixed(2)}</td>
                    <td style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {new Date(s.sold_at).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => downloadInvoice(s.id)}
                        title="Download PDF Invoice"
                      >
                        <FileDown size={12} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
