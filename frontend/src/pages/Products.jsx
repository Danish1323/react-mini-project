import { useState, useEffect } from "react";
import { getProducts, addProduct, deleteProduct, getSuppliers } from "../api/api";
import { Plus, Search, Trash2, Package, CheckCircle, AlertTriangle, Calendar, RefreshCw, X, QrCode } from "lucide-react";
import QRModal from "../components/QRModal";

function Products() {
  const [products, setProducts]   = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [showForm, setShowForm]   = useState(false);
  const [message, setMessage]     = useState(null);
  const [qrProduct, setQrProduct] = useState(null);

  const [form, setForm] = useState({
    name: "", sku: "", category: "", quantity: "", cost_price: "",
    selling_price: "", reorder_level: "10", supplier_id: "",
    expiry_date: "", restock_date: "",
  });

  useEffect(() => { loadData(); }, []);

  function loadData() {
    setLoading(true);
    Promise.all([getProducts(), getSuppliers()])
      .then(([pRes, sRes]) => {
        setProducts(pRes.data);
        setSuppliers(sRes.data);
      })
      .catch(() => showMsg("Failed to load data.", "error"))
      .finally(() => setLoading(false));
  }

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();

    // Client-side guard: quantity must be non-negative
    const qty = parseInt(form.quantity);
    if (qty < 0) {
      showMsg("Quantity cannot be negative.", "error");
      return;
    }

    const payload = {
      ...form,
      quantity: qty,
      cost_price: parseFloat(form.cost_price),
      selling_price: parseFloat(form.selling_price),
      reorder_level: parseInt(form.reorder_level),
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      expiry_date: form.expiry_date || null,
      restock_date: form.restock_date || null,
    };

    try {
      await addProduct(payload);
      showMsg("Product added successfully.");
      setForm({ name: "", sku: "", category: "", quantity: "", cost_price: "", selling_price: "", reorder_level: "10", supplier_id: "", expiry_date: "", restock_date: "" });
      setShowForm(false);
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.detail || "Failed to add product.", "error");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showMsg(`"${name}" deleted.`);
      loadData();
    } catch {
      showMsg("Failed to delete product.", "error");
    }
  }

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (category === "All" || p.category === category)
    );
  });

  if (loading) return <div className="loading"><Package size={16} /> Loading products...</div>;

  const today = new Date();
  const soon30 = new Date(); soon30.setDate(soon30.getDate() + 30);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Products</h1>
          <p>{products.length} items in inventory</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {message.text}
        </div>
      )}

      {/* Add Product Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <h2><Plus size={14} /> New Product</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Basmati Rice 5kg" />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input name="sku" required value={form.sku} onChange={handleChange} placeholder="e.g. RICE001" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input name="category" required value={form.category} onChange={handleChange} placeholder="e.g. Grocery" />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input name="quantity" type="number" required min="0" value={form.quantity} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Cost Price (₹) *</label>
                  <input name="cost_price" type="number" step="0.01" required min="0" value={form.cost_price} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input name="selling_price" type="number" step="0.01" required min="0" value={form.selling_price} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input name="reorder_level" type="number" min="0" value={form.reorder_level} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <select name="supplier_id" value={form.supplier_id} onChange={handleChange}>
                    <option value="">— None —</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Restock Date</label>
                  <input name="restock_date" type="date" value={form.restock_date} onChange={handleChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary"><Plus size={13} /> Add Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="search-row">
        <div className="search-wrap">
          <Search size={13} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h2><Package size={14} /> Product List</h2>
          <span className="card-count">{filtered.length}</span>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={36} />
              <p>No products found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Cost</th>
                  <th>Sell</th>
                  <th>Reorder</th>
                  <th>Supplier</th>
                  <th>Flags</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isLow  = p.quantity <= p.reorder_level;
                  const expiry = p.expiry_date ? new Date(p.expiry_date) : null;
                  const restock = p.restock_date ? new Date(p.restock_date) : null;
                  const expiringSOON = expiry && expiry >= today && expiry <= soon30;
                  const restockDUE = restock && restock <= soon30;

                  return (
                    <tr key={p.id} className={isLow ? "low-stock-row" : ""}>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--text-muted)" }}>{p.sku}</td>
                      <td><span className="badge badge-muted">{p.category}</span></td>
                      <td style={{ fontWeight: 700, color: isLow ? "var(--danger)" : "var(--text)" }}>{p.quantity}</td>
                      <td>₹{p.cost_price}</td>
                      <td>₹{p.selling_price}</td>
                      <td style={{ color: "var(--text-muted)" }}>{p.reorder_level}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.supplier?.name || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {isLow       && <span className="badge badge-danger"><AlertTriangle size={9} /> Low</span>}
                          {expiringSOON && <span className="badge badge-warning"><Calendar size={9} /> Expiring</span>}
                          {restockDUE  && <span className="badge badge-info"><RefreshCw size={9} /> Restock</span>}
                          {!isLow && !expiringSOON && !restockDUE && <span className="badge badge-success"><CheckCircle size={9} /> OK</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setQrProduct(p)}
                            title="View QR Code"
                          >
                            <QrCode size={13} color="var(--text-muted)" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete product"
                          >
                            <Trash2 size={13} color="var(--danger)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {qrProduct && (
        <QRModal product={qrProduct} onClose={() => setQrProduct(null)} />
      )}
    </div>
  );
}

export default Products;
