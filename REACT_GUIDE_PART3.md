# Part 3 — Lists, Conditional Rendering, Routing, API & CSS

> This part covers: Rendering lists with `.map()`, Keys, Conditional rendering, React Router, Axios API calls, CSS Variables, Import/Export

---

## Chapter 13: Rendering Lists with `.map()`

### The Problem

Imagine you have 13 products in your database. You don't want to manually write 13 `<tr>` tags. You want to say "for each product, draw a table row."

### The Solution: JavaScript's `.map()` method

`.map()` is a built-in JavaScript array method. It loops through every item in an array and transforms it into something else:

```javascript
// Regular JavaScript
const numbers = [1, 2, 3];
const doubled = numbers.map((num) => num * 2);
// doubled = [2, 4, 6]
```

In React, we use `.map()` to transform an array of data into an array of JSX elements:

```javascript
// From Transactions.jsx
<tbody>
  {filtered.map((t) => {
    //            ↑ "t" is ONE transaction object from the array
    const meta = ACTION_META[t.action];
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
</tbody>
```

**What happens step by step:**
1. `filtered` is an array like `[{id: 1, action: "SALE_RECORDED", ...}, {id: 2, ...}, ...]`
2. `.map()` goes through each item one by one
3. For each item `t`, it returns a `<tr>` (table row) with the transaction's data
4. React collects all those `<tr>` elements and draws them inside the `<tbody>`

### Another example: Supplier cards

From the `Sidebar.jsx`:
```javascript
const navItems = [
  { to: "/",             icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products",     icon: Package,          label: "Products" },
  { to: "/suppliers",    icon: Building2,        label: "Suppliers" },
  // ...
];

// Later, inside the JSX:
{navItems.map(({ to, icon: Icon, label }) => (
  <NavLink key={to} to={to}>
    <Icon size={15} />
    {label}
  </NavLink>
))}
```

Instead of writing 6 separate `<NavLink>` tags, we store the data in an array and `.map()` over it!

---

## Chapter 14: The `key` Prop (Why It Matters!)

### What is `key`?

Every time you render a list with `.map()`, React **requires** each item to have a unique `key` prop.

```javascript
// ✅ CORRECT — Each row has a unique key
{products.map((p) => (
  <tr key={p.id}>    {/* p.id is unique for each product (from database) */}
    <td>{p.name}</td>
  </tr>
))}

// ❌ WRONG — No key
{products.map((p) => (
  <tr>               {/* React will show a warning! */}
    <td>{p.name}</td>
  </tr>
))}
```

### Why does React need keys?

Imagine a list of 10 products. The user deletes the 5th product. React needs to know:
- Which specific `<tr>` to remove from the screen?
- Which other `<tr>` elements should stay exactly as they are?

Without keys, React would have to re-render ALL 10 rows (slow). With keys, React knows exactly which one was removed and only updates that one row (fast).

### What makes a good key?

- ✅ **Database ID** (`key={product.id}`) — Best choice. Unique and stable.
- ❌ **Array index** (`key={index}`) — Bad choice. If items are reordered or deleted, the indexes shift and React gets confused.

---

## Chapter 15: Conditional Rendering

Conditional rendering means showing or hiding parts of the UI based on some condition.

### Method 1: Logical AND (`&&`)

"If condition is true, show this. Otherwise show nothing."

```javascript
// From Products.jsx — Only show the form if showForm is true
{showForm && (
  <div className="card">
    <form onSubmit={handleAdd}>
      ...
    </form>
  </div>
)}
```

**How it works:** In JavaScript, `true && <something>` returns `<something>`. But `false && <something>` returns `false`, and React ignores `false` (draws nothing).

More examples from our project:

```javascript
// From Products.jsx — Show success/error message only if it exists
{message && (
  <div className={`message message-${message.type}`}>
    {message.text}
  </div>
)}

// From Dashboard.jsx — Show insights section only if there are insights
{insights.length > 0 && (
  <div className="card">
    <h2>Smart Insights</h2>
    ...
  </div>
)}

// From Products.jsx — Show the "Low" badge only if stock is low
{isLow && <span className="badge badge-danger">Low</span>}
```

### Method 2: Ternary Operator (`? :`)

"If condition is true, show A. Otherwise, show B."

```javascript
// From Header.jsx — Show Moon icon in light mode, Sun icon in dark mode
{dark ? <Sun size={15} /> : <Moon size={15} />}

// From Products.jsx — Show "Cancel" or "Add Product" depending on form state
{showForm ? <X size={14} /> : <Plus size={14} />}
{showForm ? "Cancel" : "Add Product"}
```

### Method 3: Early Return

"If a condition is met, return something immediately and skip the rest."

```javascript
// From Products.jsx — If still loading, show spinner and STOP
if (loading) return <div className="loading">Loading products...</div>;

// If we get past this line, loading is definitely false
return (
  <div className="page-content">
    {/* Full page content here */}
  </div>
);
```

```javascript
// From QRModal.jsx — If no product was passed, render nothing
function QRModal({ product, onClose }) {
  if (!product) return null;  // null = render nothing at all
  
  // If we get past this line, product definitely exists
  return (
    <div className="modal-overlay">
      ...
    </div>
  );
}
```

---

## Chapter 16: React Router (Page Navigation)

### What is React Router?

Since React is an SPA (one single HTML page), we need a way to fake "pages." We installed the `react-router-dom` library for this.

### How it works in our project

From `App.jsx`:

```javascript
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>                              {/* Wraps the entire app */}
      <AppLayout dark={dark} onToggleDark={...} />
    </BrowserRouter>
  );
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />                              {/* Always visible */}
      <div className="main-content">
        <Header />                             {/* Always visible */}
        <Routes>                               {/* Only ONE of these renders at a time */}
          <Route path="/"             element={<Dashboard />} />
          <Route path="/products"     element={<Products />} />
          <Route path="/suppliers"    element={<Suppliers />} />
          <Route path="/sales"        element={<Sales />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports"      element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
}
```

**What each piece does:**
- `<BrowserRouter>` — Wraps your app and enables routing. Must be at the top level.
- `<Routes>` — A container that looks at the current URL and decides which `<Route>` to show.
- `<Route path="/products" element={<Products />} />` — "If the URL is `/products`, draw the `<Products />` component here."
- Only ONE `<Route>` is shown at a time. The rest are hidden.

### `<NavLink>` — Clickable Navigation Links

From `Sidebar.jsx`:

```javascript
import { NavLink } from "react-router-dom";

<NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
  Products
</NavLink>
```

**Why `NavLink` instead of `<a href>`?**
- `<a href="/products">` — This would cause a full page reload (bad for SPAs!).
- `<NavLink to="/products">` — This changes the URL without reloading the page. It intercepts the click, updates the URL, and React Router shows the matching `<Route>`.
- Bonus: `NavLink` knows if you're currently on that page and adds the `"active"` class, so we can highlight the current page in the sidebar.

### `useLocation` — Reading the Current URL

From `App.jsx`:

```javascript
import { useLocation } from "react-router-dom";

function AppLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "InvenTrack";
  // If URL is "/products", location.pathname = "/products"
  // So title = "Products"
  
  return (
    <Header title={title} ... />  {/* Pass the title to the header */}
  );
}
```

---

## Chapter 17: API Integration with Axios

### What is Axios?

Axios is a JavaScript library for making HTTP requests (GET, POST, DELETE, PATCH) to a backend server. It's an alternative to the browser's built-in `fetch()` function but with a cleaner API.

### Our API File

From `api.js`:

```javascript
import axios from "axios";

// Create a reusable Axios instance with a base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Products
export const getProducts = () => API.get("/products/");
export const addProduct = (data) => API.post("/products/", data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const restockProduct = (id, qty) => API.patch(`/products/${id}/restock`, { quantity_added: qty });

// Sales
export const getSales = () => API.get("/sales/");
export const recordSale = (data) => API.post("/sales/", data);
```

**Why create an `API` instance?**
Instead of writing `"http://localhost:8000"` in every single API call, we set it once as the `baseURL`. All calls then just use the relative path (like `"/products/"`).

**What `import.meta.env.VITE_API_URL` means:**
- In development (your laptop), this is `undefined`, so it falls back to `"http://localhost:8000"`.
- In production (Vercel), this is set to your Railway backend URL.
- This is called an **environment variable**.

### HTTP Methods

| Method | Purpose | Our Example |
|--------|---------|-------------|
| `GET` | Read / fetch data | `API.get("/products/")` → Get all products |
| `POST` | Create new data | `API.post("/products/", data)` → Add a new product |
| `DELETE` | Remove data | `API.delete("/products/5")` → Delete product #5 |
| `PATCH` | Partially update data | `API.patch("/products/5/restock", { quantity_added: 20 })` → Add 20 units to product #5 |

### `Promise.all` — Parallel Requests

From `Products.jsx`:

```javascript
Promise.all([getProducts(), getSuppliers()])
  .then(([pRes, sRes]) => {
    setProducts(pRes.data);
    setSuppliers(sRes.data);
  });
```

`Promise.all` takes an array of promises and waits for ALL of them to finish. It's like ordering two dishes at a restaurant — instead of waiting for the first dish before ordering the second, you order both at once and get them at the same time!

---

## Chapter 18: Import and Export

### What is `import`/`export`?

In a React project, code is split across many files. `import` and `export` are how files share code with each other.

### Default Export (one per file)

```javascript
// File: StatCard.jsx
function StatCard({ label, value }) { ... }
export default StatCard;  // "This is THE main thing this file exports"

// File: Dashboard.jsx
import StatCard from "./components/StatCard";  // Import it
// Name can be anything: import Foo from "./components/StatCard" also works!
```

### Named Export (multiple per file)

```javascript
// File: api.js
export const getProducts = () => API.get("/products/");
export const addProduct = (data) => API.post("/products/", data);
// Multiple named exports in one file

// File: Products.jsx
import { getProducts, addProduct } from "../api/api";
// Must use EXACT names, wrapped in { }
```

### The difference:
- `export default` — One per file. Import without `{ }`. Can rename freely.
- `export const` (named) — Many per file. Import with `{ }`. Must use exact name.

---

## Chapter 19: CSS Variables & Theming

### What are CSS Custom Properties (Variables)?

CSS variables let you define a value once and reuse it everywhere:

From our `index.css`:
```css
:root {
  --bg:        #F4F0EC;       /* Page background color */
  --primary:   #FF5722;       /* Orange accent color */
  --text:      #0A0A0A;       /* Main text color */
  --border:    #0A0A0A;       /* Border color */
  --neo-shadow: 4px 4px 0 var(--border);  /* Neo-brutalist shadow */
}
```

Using them:
```css
.card {
  background: var(--card-bg);       /* Uses the variable */
  border: 2px solid var(--border);  /* Uses the variable */
  box-shadow: var(--neo-shadow);    /* Uses the variable */
}
```

### Dark Mode with CSS Variables

The magic: we override the SAME variable names under `body.dark`:

```css
body.dark {
  --bg:      #121212;       /* Dark background */
  --text:    #F4F0EC;       /* Light text */
  --border:  #E0E0E0;       /* Light border */
  --danger:  #E57373;       /* Softer red for dark backgrounds */
}
```

When `body` has the class `dark`, all variables are overridden. Every element that uses `var(--text)` automatically switches from dark text to light text. We don't change a single line of component CSS!

### How dark mode is toggled (connecting CSS to React)

From `App.jsx`:
```javascript
useEffect(() => {
  document.body.classList.toggle("dark", dark);
}, [dark]);
```

When `dark` state becomes `true`, this adds `class="dark"` to the `<body>` tag. The CSS variables instantly switch to dark mode values, and the whole app recolors itself.

---

## End of Part 3

You now understand:
- ✅ How `.map()` renders lists from arrays
- ✅ Why `key` is required and what makes a good key
- ✅ Three ways to conditionally render UI (`&&`, ternary, early return)
- ✅ How React Router works (`BrowserRouter`, `Routes`, `Route`, `NavLink`)
- ✅ How Axios talks to the backend and what HTTP methods do
- ✅ How `import`/`export` connects files together
- ✅ How CSS Variables enable instant dark mode theming

**Next:** [Part 4 — Viva Q&A Practice →](./REACT_GUIDE_PART4.md)
