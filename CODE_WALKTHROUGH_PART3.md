# Code Walkthrough Part 3 — Suppliers, Transactions, Reports & CSS

---

## File 12: `frontend/src/pages/Suppliers.jsx`

Manages the supplier directory — add, view, and delete suppliers displayed as cards.

### Block 1: State & CRUD Functions

```jsx
function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm]  = useState(false);
  const [message, setMessage]   = useState(null);
  const [form, setForm] = useState({
    name: "", contact_person: "", phone: "", email: "", address: "",
  });

  useEffect(() => { loadSuppliers(); }, []);

  function loadSuppliers() {
    setLoading(true);
    getSuppliers()
      .then((res) => setSuppliers(res.data))
      .catch(() => showMsg("Failed to load suppliers.", "error"))
      .finally(() => setLoading(false));
  }
```

Same pattern as Products: state for the list, loading flag, form visibility, toast messages, and the form object. `loadSuppliers` is a named function so we can call it after add/delete to refresh the list.

### Block 2: Delete with Confirmation

```jsx
  async function handleDelete(id, name) {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      showMsg(`"${name}" removed.`);
      loadSuppliers();
    } catch {
      showMsg("Failed to delete supplier.", "error");
    }
  }
```

- `window.confirm(...)` pops up the browser's native confirmation dialog. If the user clicks "Cancel", `confirm()` returns `false` and we `return` early without deleting.
- After successful deletion, we reload the supplier list.

### Block 3: Card Grid Layout

```jsx
  <div className="supplier-grid">
    {suppliers.map((s) => (
      <div key={s.id} className="supplier-card">
        <div className="supplier-card-top">
          <div>
            <div className="supplier-name">{s.name}</div>
            {s.contact_person && (
              <div className="supplier-contact">
                <User size={10} /> {s.contact_person}
              </div>
            )}
          </div>
          <button onClick={() => handleDelete(s.id, s.name)}>
            <Trash2 size={13} color="var(--danger)" />
          </button>
        </div>

        {s.phone && <div className="supplier-detail"><Phone size={11} /> {s.phone}</div>}
        {s.email && <div className="supplier-detail"><Mail size={11} /> {s.email}</div>}
        {s.address && <div className="supplier-detail"><MapPin size={11} /> {s.address}</div>}
      </div>
    ))}
  </div>
```

- Unlike Products (which uses a table), Suppliers uses a card grid for a visual layout.
- `{s.phone && (...)}` — Conditional rendering. If the phone field is empty/null, the phone row is hidden entirely. Same for email and address.
- `() => handleDelete(s.id, s.name)` — Arrow function wrapper is critical. Without it, `handleDelete(s.id, s.name)` would execute immediately on render!

---

## File 13: `frontend/src/pages/Transactions.jsx`

Displays an audit log of all inventory events with filtering.

### Block 1: Action Metadata Map

```jsx
const ACTION_META = {
  SALE_RECORDED:   { label: "Sale",           icon: ShoppingCart, badge: "badge-success" },
  PRODUCT_ADDED:   { label: "Product Added",  icon: Package,      badge: "badge-info"    },
  PRODUCT_DELETED: { label: "Product Deleted", icon: Trash2,       badge: "badge-danger"  },
  STOCK_UPDATED:   { label: "Stock Updated",  icon: RefreshCw,    badge: "badge-primary" },
};
```

Maps each backend action type to a display label, icon, and CSS badge class. This is defined outside the component so it's only created once (not on every render).

### Block 2: State, Fetch & Filter

```jsx
function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("All");

  useEffect(() => {
    getTransactions()
      .then((res) => setTransactions(res.data))
      .catch(() => alert("Could not load transactions."))
      .finally(() => setLoading(false));
  }, []);

  const actionTypes = ["All", ...new Set(transactions.map((t) => t.action))];
  const filtered = filter === "All" ? transactions : transactions.filter((t) => t.action === filter);
```

- `new Set(transactions.map(t => t.action))` extracts unique action types from the data for the filter dropdown.
- Client-side filtering: if filter is "All", show everything. Otherwise, show only transactions matching the selected action type.

### Block 3: Table with Dynamic Badges

```jsx
  {filtered.map((t) => {
    const meta = ACTION_META[t.action] || { label: t.action, icon: ClipboardList, badge: "badge-muted" };
    const Icon = meta.icon;
    return (
      <tr key={t.id}>
        <td>#{t.id}</td>
        <td>
          <span className={`badge ${meta.badge}`}>
            <Icon size={9} />
            {meta.label}
          </span>
        </td>
        <td><strong>{t.product_name || "—"}</strong></td>
        <td>{t.details}</td>
        <td>{new Date(t.timestamp).toLocaleString("en-IN")}</td>
      </tr>
    );
  })}
```

- `ACTION_META[t.action] || {...}` — Looks up the metadata for this action type. The `||` fallback handles any unknown action types gracefully.
- Each action gets a colored badge: green for sales, blue for additions, red for deletions.
- `t.product_name || "—"` — If the product was deleted and the name is null, show a dash.

---

## File 14: `frontend/src/pages/Reports.jsx`

Analytics page with three report sections, charts, tables, and CSV export.

### Block 1: CSV Export Utility

```jsx
function exportCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

This is a plain utility function (not a component) that converts any array of objects into a CSV file:
1. `Object.keys(data[0])` gets the column headers from the first object's keys.
2. `Object.values(row).join(",")` turns each row's values into a comma-separated string.
3. `new Blob(...)` creates an in-memory file with `text/csv` type.
4. The download trick (create `<a>`, set href, click) triggers the browser download.

### Block 2: Triple API Fetch

```jsx
  useEffect(() => {
    Promise.all([getCategoryStockReport(), getLowStockReport(), getProfitSummary()])
      .then(([catRes, lowRes, profRes]) => {
        setCategoryData(catRes.data);
        setLowStockData(lowRes.data);
        setProfitData(profRes.data);
      })
      .catch(() => alert("Failed to load reports."))
      .finally(() => setLoading(false));
  }, []);
```

Three API calls fired simultaneously with `Promise.all`. Each response populates its own state variable.

### Block 3: Category Stock — Chart + Table Side-by-Side

```jsx
  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr" }}>
    {/* Left: Bar Chart */}
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8D1C5" vertical={false} />
          <XAxis dataKey="category" ... />
          <Bar dataKey="total_qty" fill="#452829" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Right: Data Table */}
    <div className="table-wrap">
      <table>
        <thead><tr><th>Category</th><th>Products</th><th>Total Qty</th></tr></thead>
        <tbody>
          {categoryData.map((row) => (
            <tr key={row.category}>
              <td><span className="badge badge-muted">{row.category}</span></td>
              <td>{row.product_count}</td>
              <td><strong>{row.total_qty}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
```

A CSS Grid layout splits the section into a chart (60%) and a table (40%) side by side. Both display the same `categoryData` — one visually, one numerically.

### Block 4: Monthly Profit — Line Chart

```jsx
  <ResponsiveContainer width="100%" height={230}>
    <LineChart data={profitData}>
      <Line type="monotone" dataKey="revenue" stroke="#452829" strokeWidth={2}
        name="Revenue" dot={{ r: 3, fill: "#452829" }} />
      <Line type="monotone" dataKey="profit" stroke="#3d7a5a" strokeWidth={2}
        name="Profit" dot={{ r: 3, fill: "#3d7a5a" }} />
    </LineChart>
  </ResponsiveContainer>
```

Two lines on the same chart: revenue (dark) and profit (green). `type="monotone"` creates smooth curves between data points. Each data point gets a small circle dot (`r: 3`).

### Block 5: Profit Margin Calculation

```jsx
  {profitData.map((row) => (
    <tr key={row.month}>
      <td>{row.month}</td>
      <td>{row.transactions}</td>
      <td style={{ color: "var(--info)" }}>₹{row.revenue.toFixed(2)}</td>
      <td style={{ color: "var(--success)" }}>₹{row.profit.toFixed(2)}</td>
      <td>
        <span className="badge badge-success">
          {row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0}%
        </span>
      </td>
    </tr>
  ))}
```

The profit margin percentage is a **derived value** computed inline: `(profit / revenue) * 100`. The ternary guard `row.revenue > 0 ?` prevents division by zero.

---

## File 15: CSS Design System — `frontend/src/index.css` (Key Highlights)

### CSS Variables (Root)

```css
:root {
  --bg:            #F4F0EC;
  --card-bg:       rgba(255, 255, 255, 0.65);
  --primary:       #FF5722;
  --border:        #0A0A0A;
  --text:          #0A0A0A;
  --neo-shadow:    4px 4px 0 var(--border);
  --font:          'Inter', system-ui, sans-serif;
  --font-head:     'Space Grotesk', system-ui, sans-serif;
}
```

All colors, fonts, and design tokens are defined as CSS custom properties. Every component references these variables with `var(--name)`.

### Dark Mode Override

```css
body.dark {
  --bg:            #121212;
  --card-bg:       rgba(30, 30, 30, 0.65);
  --border:        #E0E0E0;
  --text:          #F4F0EC;
  --danger:        #E57373;
  --success:       #66BB6A;
}
```

When `<body>` has the `dark` class, all variables are overridden. Every element using `var(--text)` instantly switches from dark to light text. Zero JavaScript needed for the color change — it's pure CSS.

### Neo-Brutalist Card Style

```css
.card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  border: 2px solid var(--border);
  box-shadow: var(--neo-shadow);     /* 4px 4px 0 — hard shadow */
  border-radius: var(--radius);
  transition: transform 0.2s;
}

.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--neo-shadow-lg);  /* 6px 6px 0 — bigger shadow */
}
```

- **Neo-Brutalism**: Hard borders + blocky, non-blurred shadows.
- **Glassmorphism**: `backdrop-filter: blur(16px)` + semi-transparent background.
- **Hover effect**: The card lifts up and left by 2px, and its shadow grows, creating a tactile "pop" feeling.

### Responsive Design

```css
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .two-col { grid-template-columns: 1fr; }
}
```

On mobile screens (under 768px):
- The sidebar is hidden off-screen by default and slides in when `open` class is added.
- The stat cards switch from 4 columns to 2 columns.
- Two-column chart layouts stack vertically.

---

## Summary: File Map

| # | File | Purpose | Key Concepts |
|---|------|---------|-------------|
| 1 | `main.jsx` | Entry point | `createRoot`, `StrictMode` |
| 2 | `App.jsx` | Layout + Routing | `BrowserRouter`, `Routes`, `useLocation`, dark mode |
| 3 | `api.js` | API client | `axios.create`, centralized baseURL, HTTP methods |
| 4 | `Header.jsx` | Top bar | Props, ternary rendering, date formatting |
| 5 | `Sidebar.jsx` | Navigation | `NavLink`, `.map()`, Fragments, `isActive` |
| 6 | `StatCard.jsx` | KPI card | Custom hook (`useCountUp`), `setInterval`, cleanup |
| 7 | `AlertPanel.jsx` | Alert row | Conditional rendering with `&&` |
| 8 | `QRModal.jsx` | QR popup | `useRef`, canvas download, `stopPropagation` |
| 9 | `Dashboard.jsx` | Dashboard page | `Promise.all`, charts (recharts), restock modal |
| 10 | `Products.jsx` | CRUD page | Controlled forms, `.filter()`, `async/await` |
| 11 | `Sales.jsx` | Sales page | Client-side validation, derived values, PDF download |
| 12 | `Suppliers.jsx` | Suppliers page | Card grid, `window.confirm`, conditional detail rows |
| 13 | `Transactions.jsx` | Audit log | Metadata map, dynamic badges, filter dropdown |
| 14 | `Reports.jsx` | Analytics | CSV export, LineChart, computed profit margins |
| 15 | `index.css` | Design system | CSS variables, dark mode, neo-brutalism, responsive |

---

> **You now have a block-by-block understanding of every frontend file.** Use this alongside the React Study Guide (Parts 1–4) to explain any line of code in your viva! 🚀
