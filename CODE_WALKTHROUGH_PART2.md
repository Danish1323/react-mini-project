# Code Walkthrough Part 2 — Dashboard, Products & Sales Pages

---

## File 9: `frontend/src/pages/Dashboard.jsx`

The main landing page. Shows KPI cards, AI insights, alerts, charts, and recent activity.

### Block 1: Imports & Constants

```jsx
import { useState, useEffect } from "react";
import { getDashboard, getInsights, restockProduct } from "../api/api";
import StatCard from "../components/StatCard";
import AlertPanel from "../components/AlertPanel";
import { Package, AlertTriangle, IndianRupee, TrendingUp, ... } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ... ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#452829", "#7a4545", "#a06060", "#57595B", "#888b8d", "#c4a89a"];

const ACTION_ICONS = {
  SALE_RECORDED:   { icon: IndianRupee, bg: "#edf7f2", color: "#3d7a5a" },
  PRODUCT_ADDED:   { icon: Package,     bg: "#edf3fc", color: "#2b5fa0" },
  PRODUCT_DELETED: { icon: Package,     bg: "#fdf0f0", color: "#b83232" },
  STOCK_UPDATED:   { icon: Activity,    bg: "#f5ede8", color: "#452829" },
};
```

- `recharts` is a charting library. We import `BarChart`, `PieChart`, etc.
- `PIE_COLORS` — A palette of 6 colors used for pie chart slices.
- `ACTION_ICONS` — Maps each transaction type to an icon, background color, and text color for the activity feed.

### Block 2: State & Data Fetching

```jsx
function Dashboard() {
  const [data, setData]             = useState(null);
  const [insights, setInsights]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty]   = useState("");

  useEffect(() => {
    Promise.all([getDashboard(), getInsights()])
      .then(([dRes, iRes]) => {
        setData(dRes.data);
        setInsights(iRes.data);
      })
      .catch(() => alert("Could not reach backend. Is it running?"))
      .finally(() => setLoading(false));
  }, []);
```

- 5 state variables: dashboard data, AI insights, loading flag, and restock modal state.
- `Promise.all` fires both API calls **simultaneously**. When both resolve, we destructure the results into `dRes` (dashboard) and `iRes` (insights) and save them to state.

### Block 3: Restock Logic

```jsx
  const openRestockModal = (id, name) => {
    setRestockItem({ id, name });
    setRestockQty("");
  };

  const submitRestock = async () => {
    if (!restockItem) return;
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    try {
      await restockProduct(restockItem.id, qty);
      const [dRes, iRes] = await Promise.all([getDashboard(), getInsights()]);
      setData(dRes.data);
      setInsights(iRes.data);
      setRestockItem(null);
    } catch (err) {
      alert("Failed to restock product.");
    }
  };
```

- `openRestockModal` saves which product we're restocking and clears the quantity input.
- `submitRestock` validates the input, calls the PATCH API endpoint, then refreshes the entire dashboard by re-fetching both endpoints. `setRestockItem(null)` closes the modal.

### Block 4: KPI Cards

```jsx
  <div className="stat-grid">
    <StatCard icon={Package}       label="Total Products"  value={data.total_products}                      color="maroon" />
    <StatCard icon={AlertTriangle} label="Low Stock Items" value={data.low_stock_count}                     color="red"    />
    <StatCard icon={IndianRupee}   label="Total Revenue"   value={`₹${data.total_sales.toLocaleString()}`}  color="green"  />
    <StatCard icon={TrendingUp}    label="Total Profit"    value={`₹${data.total_profit.toLocaleString()}`} color="orange" />
  </div>
```

4 `StatCard` components, each receiving an icon, label, value, and color. The value for revenue/profit is formatted with the ₹ symbol and Indian number separating (`.toLocaleString()`).

### Block 5: AI Smart Insights

```jsx
  {insights.length > 0 && (
    <div className="card">
      <div className="card-header">
        <h2><Sparkles size={14} /> Smart Insights</h2>
        <span className="card-count">{insights.length} alerts</span>
      </div>
      <div className="card-body">
        {insights.map((item) => {
          const Icon = item.level === "critical" ? AlertCircle : 
                       item.level === "warning" ? AlertTriangle : Info;
          return (
            <div key={item.id} className={`insight-item ${item.level}`}>
              <div className="insight-icon"><Icon size={14} /></div>
              <div className="insight-body">
                <div className="i-name">{item.name}</div>
                <div className="i-msg">{item.message}</div>
                <div className="i-meta">Stock: {item.quantity} · Avg sales: {item.avg_daily_sales}/day</div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => openRestockModal(item.id, item.name)}>
                Restock
              </button>
            </div>
          );
        })}
      </div>
    </div>
  )}
```

- Only renders if there are insights (`insights.length > 0`).
- Each insight row shows an icon (based on severity level), product name, AI-generated message, stock info, and a Restock button.
- Chained ternary picks the right icon: critical → AlertCircle, warning → AlertTriangle, info → Info.

### Block 6: Charts (Bar + Pie)

```jsx
  <div className="two-col">
    {/* Bar Chart — Category Stock */}
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data.category_summary}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8d1c5" vertical={false} />
        <XAxis dataKey="category" ... />
        <YAxis ... />
        <Tooltip ... />
        <Bar dataKey="total_qty" fill="#452829" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>

    {/* Pie Chart — Top Selling */}
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie data={data.top_selling} dataKey="total_sold" nameKey="name"
          outerRadius={80} innerRadius={38} paddingAngle={3}
          label={({ name, percent }) => `${name.split(" ")[0]} ${(percent*100).toFixed(0)}%`}>
          {data.top_selling.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
```

- `ResponsiveContainer` makes the chart adapt to the parent's width.
- `dataKey="total_qty"` tells the BarChart which field from the data array to plot.
- `radius={[4,4,0,0]}` rounds the top corners of each bar.
- The Pie chart has `innerRadius={38}` making it a **donut chart** (hollow center).
- `Cell` assigns a different color to each pie slice using our `PIE_COLORS` array.

### Block 7: Restock Modal

```jsx
  {restockItem && (
    <div className="modal-overlay" onClick={() => setRestockItem(null)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Restock Product</div>
          <div className="modal-subtitle">Add units for {restockItem.name}</div>
        </div>
        <div className="form-group">
          <label>Quantity to Add</label>
          <input type="number" min="1" value={restockQty}
            onChange={(e) => setRestockQty(e.target.value)} autoFocus />
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setRestockItem(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitRestock}>Confirm Restock</button>
        </div>
      </div>
    </div>
  )}
```

- Renders only when `restockItem` is not null.
- `e.stopPropagation()` on the inner box prevents clicks inside the modal from closing it (only overlay clicks close it).
- `autoFocus` puts the cursor in the input automatically when the modal opens.

---

## File 10: `frontend/src/pages/Products.jsx`

The most complex page — full CRUD (Create, Read, Update, Delete) with search, filtering, and QR codes.

### Block 1: State Variables

```jsx
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
```

10 state variables managing: product list, supplier dropdown data, loading state, search text, category filter, form visibility, toast messages, QR modal, and the 10-field form object.

### Block 2: Data Loading

```jsx
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
```

Fetches products and suppliers in parallel on mount. `loadData` is extracted as a named function so we can re-call it after adding or deleting a product.

### Block 3: Form Handler

```jsx
function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
}
```

One handler for ALL 10 input fields. `[e.target.name]` uses the input's `name` attribute as the object key. The spread `...form` copies all existing fields, then the computed property overwrites just the one field that changed.

### Block 4: Add Product

```jsx
async function handleAdd(e) {
  e.preventDefault();
  const qty = parseInt(form.quantity);
  if (qty < 0) { showMsg("Quantity cannot be negative.", "error"); return; }

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
    setForm({...}); // Reset form
    setShowForm(false);
    loadData();
  } catch (err) {
    showMsg(err.response?.data?.detail || "Failed to add product.", "error");
  }
}
```

- `e.preventDefault()` stops the browser from reloading the page.
- The `payload` converts string form values to proper types (numbers, nulls) before sending to the backend.
- `err.response?.data?.detail` — Optional chaining (`?.`) safely accesses nested properties. If the backend returned a validation error message, we show it. Otherwise we show a generic error.

### Block 5: Client-Side Filtering

```jsx
const categories = ["All", ...new Set(products.map((p) => p.category))];

const filtered = products.filter((p) => {
  const q = search.toLowerCase();
  return (
    (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
    (category === "All" || p.category === category)
  );
});
```

- `new Set(products.map(p => p.category))` extracts all unique categories from the product list. `Set` automatically removes duplicates.
- `filtered` chains two conditions: the search query must match the name or SKU, AND the category must match (unless "All" is selected).
- This is entirely client-side — no extra API calls needed for search/filter!

### Block 6: Table with Flags

```jsx
{filtered.map((p) => {
  const isLow       = p.quantity <= p.reorder_level;
  const expiry      = p.expiry_date ? new Date(p.expiry_date) : null;
  const expiringSOON = expiry && expiry >= today && expiry <= soon30;
  const restockDUE   = restock && restock <= soon30;

  return (
    <tr key={p.id} className={isLow ? "low-stock-row" : ""}>
      <td><strong>{p.name}</strong></td>
      <td>{p.sku}</td>
      <td><span className="badge">{p.category}</span></td>
      <td style={{ color: isLow ? "var(--danger)" : "var(--text)" }}>{p.quantity}</td>
      {/* ... */}
      <td>
        {isLow       && <span className="badge badge-danger">Low</span>}
        {expiringSOON && <span className="badge badge-warning">Expiring</span>}
        {restockDUE   && <span className="badge badge-info">Restock</span>}
        {!isLow && !expiringSOON && !restockDUE && <span className="badge badge-success">OK</span>}
      </td>
    </tr>
  );
})}
```

For each product, we compute three boolean flags (low stock, expiring soon, restock due) and conditionally render colored badges. If none of the warning flags are true, we show a green "OK" badge.

---

## File 11: `frontend/src/pages/Sales.jsx`

Records sales, shows history, and generates PDF invoices.

### Block 1: State & Data Loading (same pattern as Products)

```jsx
const [sales, setSales]         = useState([]);
const [products, setProducts]   = useState([]);
const [loading, setLoading]     = useState(true);
const [showForm, setShowForm]   = useState(false);
const [message, setMessage]     = useState(null);
const [submitting, setSubmitting] = useState(false);
const [form, setForm]           = useState({ product_id: "", quantity_sold: "" });
```

`submitting` is a separate flag that disables the submit button while a sale is being recorded, preventing double submissions.

### Block 2: Record Sale with Validation

```jsx
async function handleRecord(e) {
  e.preventDefault();
  const qty = parseInt(form.quantity_sold);
  const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));

  if (selectedProduct && qty > selectedProduct.quantity) {
    showMsg(`Only ${selectedProduct.quantity} unit(s) available in stock.`, "error");
    return;
  }
  if (qty <= 0) { showMsg("Quantity must be at least 1.", "error"); return; }

  setSubmitting(true);
  try {
    await recordSale({ product_id: parseInt(form.product_id), quantity_sold: qty });
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
```

- `products.find(...)` locates the selected product in our local state to check its stock.
- Client-side guard: if the user tries to sell more units than available, we reject immediately without hitting the backend.
- `finally` runs whether the request succeeded or failed, resetting the `submitting` flag.

### Block 3: Live Sale Preview

```jsx
const selectedProduct = products.find((p) => p.id === parseInt(form.product_id));
const qty = parseInt(form.quantity_sold) || 0;
const previewRevenue = selectedProduct ? (selectedProduct.selling_price * qty).toFixed(2) : "—";
const previewProfit  = selectedProduct ? ((selectedProduct.selling_price - selectedProduct.cost_price) * qty).toFixed(2) : "—";
```

These are **derived values** (not state). They are recalculated automatically on every render. As the user types a quantity, the preview updates in real-time without needing an API call.

### Block 4: Invoice Download

```jsx
async function downloadInvoice(saleId) {
  try {
    const res = await fetchInvoice(saleId);
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
```

- `fetchInvoice` (our centralized API function) sends a GET request with `responseType: "blob"`.
- `URL.createObjectURL(new Blob(...))` converts the raw binary PDF data into a temporary browser URL.
- We create a hidden `<a>` tag, set the download filename, and programmatically click it.
- `URL.revokeObjectURL` cleans up the temporary URL from browser memory.

### Block 5: Sales Table (Reverse Chronological)

```jsx
{[...sales].reverse().map((s) => (
  <tr key={s.id}>
    <td>#{s.id}</td>
    <td><strong>{s.product?.name || `Product #${s.product_id}`}</strong></td>
    <td>{s.quantity_sold}</td>
    <td>₹{s.selling_price_at_sale}</td>
    <td style={{ color: "var(--info)" }}>₹{s.total_sale_amount.toFixed(2)}</td>
    <td style={{ color: "var(--success)" }}>₹{s.total_profit.toFixed(2)}</td>
    <td>{new Date(s.sold_at).toLocaleString("en-IN")}</td>
    <td>
      <button className="btn btn-outline btn-sm" onClick={() => downloadInvoice(s.id)}>
        <FileDown size={12} /> PDF
      </button>
    </td>
  </tr>
))}
```

- `[...sales].reverse()` — Creates a copy of the sales array and reverses it so the newest sale appears first. We spread into a new array (`[...sales]`) to avoid mutating the original state.
- `s.product?.name || \`Product #${s.product_id}\`` — Optional chaining. If the product relationship exists, show its name. Otherwise, fall back to showing the raw ID.

---

**Next:** [Part 3 — Suppliers, Transactions, Reports & CSS →](./CODE_WALKTHROUGH_PART3.md)
