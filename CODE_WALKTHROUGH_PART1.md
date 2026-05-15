# Code Walkthrough Part 1 — Entry Files, API Layer & Reusable Components

---

## File 1: `frontend/src/main.jsx` (The Entry Point)

This is the very first file that executes. It connects React to the HTML page.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

| Line | What it does |
|------|-------------|
| `import { StrictMode } from 'react'` | Imports React's StrictMode wrapper, which helps detect bugs during development (double-renders components to find side effects). Does nothing in production. |
| `import { createRoot } from 'react-dom/client'` | Imports the function that attaches React to the real HTML page. `react-dom` is the bridge between React and the browser's DOM. |
| `import './index.css'` | Loads our entire 900+ line stylesheet. All CSS variables, component styles, dark mode — everything lives here. |
| `import App from './App.jsx'` | Imports our root component — the entire application skeleton. |
| `createRoot(document.getElementById('root'))` | Finds the `<div id="root"></div>` in `index.html`. This is the only real HTML element — React fills everything inside it. |
| `.render(<StrictMode><App /></StrictMode>)` | Renders our `App` component inside that root div. The app is now alive! |

---

## File 2: `frontend/src/App.jsx` (The App Skeleton)

This file defines the overall layout (sidebar + header + page content) and sets up routing.

### Block 1: Imports

```jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Sales from "./pages/Sales";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import "./index.css";
```

- `useState`, `useEffect` — React Hooks for state management and side effects.
- `BrowserRouter`, `Routes`, `Route` — From `react-router-dom`, handles URL-based navigation.
- `useLocation` — Hook that tells us the current URL path (e.g., `/products`).
- All the component/page imports bring in the individual pieces of our app.

### Block 2: Page Title Map

```jsx
const PAGE_TITLES = {
  "/":             "Dashboard",
  "/products":     "Products",
  "/suppliers":    "Suppliers",
  "/sales":        "Sales",
  "/transactions": "Transactions",
  "/reports":      "Reports",
};
```

A simple JavaScript object that maps each URL to a page title. When the URL is `/sales`, we look up `PAGE_TITLES["/sales"]` and get `"Sales"`, which we show in the header.

### Block 3: AppLayout Component

```jsx
function AppLayout({ dark, onToggleDark }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "InvenTrack";
```

- `sidebarOpen` state controls whether the mobile sidebar is visible.
- `useLocation()` returns an object with a `pathname` property (the current URL).
- We look up the title from our map. If the URL doesn't exist in the map, we default to `"InvenTrack"`.

```jsx
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header
          title={title}
          onHamburgerClick={() => setSidebarOpen(true)}
          dark={dark}
          onToggleDark={onToggleDark}
        />
        <Routes>
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

- `<Sidebar>` receives `isOpen` and `onClose` as props. When the user clicks the hamburger button in the header, `setSidebarOpen(true)` shows the sidebar. When they click the overlay, `onClose` hides it.
- `<Header>` receives the page `title`, a function to open the sidebar, the dark mode state, and a toggle function.
- `<Routes>` contains all 6 routes. React Router checks the current URL and renders only the matching `<Route>`. If the URL is `/reports`, only `<Reports />` is drawn. Everything else is hidden.

### Block 4: Root App Component

```jsx
function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <BrowserRouter>
      <AppLayout dark={dark} onToggleDark={() => setDark((d) => !d)} />
    </BrowserRouter>
  );
}

export default App;
```

- `useState(() => localStorage.getItem("theme") === "dark")` — Initializes dark mode from the browser's localStorage. The `() =>` syntax is a **lazy initializer** — it runs only once on first render, so we don't read localStorage on every re-render.
- `useEffect` with `[dark]` dependency — Every time `dark` changes, it: (1) toggles the `"dark"` CSS class on `<body>`, which activates all dark mode CSS variables; (2) saves the preference to localStorage so it persists across sessions.
- `setDark((d) => !d)` — The functional updater form. `d` is the current value of `dark`. `!d` flips it. This is safer than `setDark(!dark)` when the state update depends on the previous state.
- `<BrowserRouter>` wraps everything, enabling client-side routing.

---

## File 3: `frontend/src/api/api.js` (Centralized API Layer)

This file creates a single Axios instance and exports all API functions.

```jsx
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});
```

- `axios.create()` creates a reusable HTTP client with a pre-configured base URL.
- `import.meta.env.VITE_API_URL` — In production (Vercel), this environment variable points to our Railway backend. In development, it's undefined, so we fall back to `localhost:8000`.

```jsx
export const getProducts = () => API.get("/products/");
export const addProduct = (data) => API.post("/products/", data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const restockProduct = (id, quantity_added) =>
  API.patch(`/products/${id}/restock`, { quantity_added });
```

Each function is a one-liner that makes an HTTP request:
- `GET` — Fetch data (read)
- `POST` — Send new data (create)
- `DELETE` — Remove data
- `PATCH` — Partially update data (add stock without replacing the whole product)

The template literal `` `/products/${id}` `` injects the product ID into the URL, e.g., `/products/5`.

```jsx
export const downloadInvoice = (saleId) =>
  API.get(`/invoices/${saleId}`, { responseType: "blob" });
```

`responseType: "blob"` tells Axios to treat the response as raw binary data (a PDF file), not as JSON text.

---

## File 4: `frontend/src/components/Header.jsx`

The top navigation bar with page title, date, and dark mode toggle.

```jsx
import { Menu, Sun, Moon } from "lucide-react";

function Header({ title, onHamburgerClick, dark, onToggleDark }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
```

- We import three icons from `lucide-react` (a lightweight icon library).
- The component receives 4 props from `AppLayout`.
- `new Date().toLocaleDateString("en-IN", {...})` formats today's date in Indian English format, e.g., "Thu, 15 May 2026".

```jsx
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onHamburgerClick} aria-label="Toggle menu">
          <Menu size={18} />
        </button>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{today}</span>
        <button className="theme-toggle" onClick={onToggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <span className="live-dot">
          <span className="live-dot-circle" />
          Live
        </span>
      </div>
    </header>
  );
}

export default Header;
```

- The hamburger button calls `onHamburgerClick` which opens the sidebar (on mobile).
- `{dark ? <Sun /> : <Moon />}` — Ternary conditional rendering. If dark mode is on, show the Sun icon (click to go light). Otherwise, show the Moon.
- `aria-label` is an accessibility attribute for screen readers.
- The "Live" dot is purely visual — a pulsing green circle CSS animation.

---

## File 5: `frontend/src/components/Sidebar.jsx`

The left navigation sidebar with brand logo and menu links.

### Block 1: Nav Items Array

```jsx
const navItems = [
  { to: "/",             icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products",     icon: Package,          label: "Products" },
  { to: "/suppliers",    icon: Building2,        label: "Suppliers" },
  { to: "/sales",        icon: ShoppingCart,     label: "Sales" },
  { to: "/transactions", icon: ClipboardList,    label: "Transactions" },
  { to: "/reports",      icon: BarChart2,        label: "Reports" },
];
```

Instead of copy-pasting 6 `<NavLink>` tags, we store the data in an array and `.map()` over it. Each object has a URL (`to`), an icon component, and a label string.

### Block 2: Component

```jsx
function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
```

- `<>...</>` is a **Fragment**. It lets us return two sibling elements (the overlay and the aside) without wrapping them in a div.
- The overlay is a transparent black layer behind the sidebar. On mobile, clicking it closes the sidebar via `onClose`.
- `isOpen ? "active" : ""` conditionally adds the `active` CSS class. When active, the overlay becomes visible and the sidebar slides in.

```jsx
        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={onClose}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
```

- `.map()` loops through `navItems`, destructuring each object into `to`, `Icon`, and `label`.
- `key={to}` — React needs unique keys for list items. The URL path is unique for each nav item.
- `end={to === "/"}` — Without `end`, the Dashboard link (`/`) would match ALL URLs because every URL starts with `/`. The `end` prop says "only match if the URL is exactly `/`".
- `className={({ isActive }) => ...}` — NavLink provides an `isActive` boolean. We use it to highlight the currently active page.
- `onClick={onClose}` — On mobile, after clicking a link, we close the sidebar.

---

## File 6: `frontend/src/components/StatCard.jsx`

A KPI card with an animated counter (like "Total Revenue: ₹27,258").

### Block 1: Custom Hook `useCountUp`

```jsx
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const raw = String(target).replace(/[₹,\s]/g, "");
    const numeric = parseFloat(raw);
    if (isNaN(numeric) || numeric === 0) {
      setDisplay(target);
      return;
    }

    let start = 0;
    const steps = 40;
    const increment = numeric / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numeric) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        const prefix = String(target).startsWith("₹") ? "₹" : "";
        setDisplay(prefix + Math.floor(start).toLocaleString("en-IN"));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return display;
}
```

This is a **custom hook** — a reusable function that uses other hooks internally.

- It takes a `target` value (like `"₹27,258"`) and a `duration` (default 900ms).
- It strips the ₹ symbol and commas to get the raw number (`27258`).
- It creates a `setInterval` timer that increments a counter 40 times over 900ms.
- Each tick, it updates `display` with the current animated value.
- When the counter reaches the target, it stops and shows the exact original string.
- `return () => clearInterval(timer)` — Cleanup function prevents memory leaks.

### Block 2: Color Map

```jsx
const COLOR_MAP = {
  maroon: { bg: "#eaf3f3", color: "#2F4550" },
  green:  { bg: "#e6f5f0", color: "#1f7a5e" },
  orange: { bg: "#fff4e0", color: "#a06000" },
  red:    { bg: "#fdf0f0", color: "#b83232" },
};
```

Pre-defined color palettes for each stat card variant. The `bg` is the icon's background, `color` is the icon's foreground.

### Block 3: The Component

```jsx
function StatCard({ icon: Icon, label, value, color }) {
  const style = COLOR_MAP[color] || COLOR_MAP.maroon;
  const animated = useCountUp(value);

  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: style.bg }}>
        <Icon size={18} color={style.color} />
      </div>
      <div className="stat-body">
        <h3 className="stat-value">{animated}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}
```

- `{ icon: Icon }` — Renames the `icon` prop to `Icon` (uppercase) so React treats it as a component.
- `useCountUp(value)` — Calls our custom hook. `animated` starts at 0 and counts up to the target value.
- `{animated}` renders the currently animated number, creating a counting-up effect.

---

## File 7: `frontend/src/components/AlertPanel.jsx`

A small alert row component used in the Dashboard's Alerts section.

```jsx
import { AlertTriangle, AlertCircle } from "lucide-react";

function AlertPanel({ type, title, detail, onRestock }) {
  const Icon = type === "danger" ? AlertCircle : AlertTriangle;
  const color = type === "danger" ? "var(--danger)" : "var(--warning)";

  return (
    <div className={`alert-item ${type}`}>
      <Icon size={14} color={color} />
      <div style={{ flex: 1 }}>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      {onRestock && (
        <button className="btn btn-sm btn-outline" onClick={onRestock}>
          Restock
        </button>
      )}
    </div>
  );
}
```

- `type` is either `"danger"` (expiring products) or `"warning"` (restock due).
- The ternary selects the right icon and color based on the type.
- `{onRestock && (...)}` — Conditional rendering. The Restock button only appears if the parent passed an `onRestock` callback function. Expiry alerts don't have this button; restock alerts do.

---

## File 8: `frontend/src/components/QRModal.jsx`

A popup modal that generates and displays a QR code for any product.

### Block 1: Setup

```jsx
function QRModal({ product, onClose }) {
  const canvasRef = useRef(null);

  const qrValue = JSON.stringify({
    name: product.name, sku: product.sku,
    category: product.category, qty: product.quantity,
  });
```

- `useRef(null)` creates a reference to a DOM element. We attach it to the QR code container so we can access the `<canvas>` element for downloading.
- `JSON.stringify(...)` converts the product info into a JSON text string. This is what gets encoded into the QR code's black and white squares.

### Block 2: Download Function

```jsx
  function handleDownload() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${product.sku}.png`;
    a.click();
  }
```

- `canvasRef.current?.querySelector("canvas")` — Finds the `<canvas>` element that `QRCodeCanvas` rendered.
- `canvas.toDataURL("image/png")` — Converts the canvas pixels into a base64-encoded PNG data URL.
- We programmatically create an `<a>` tag, set the download filename, and `.click()` it to trigger the browser's download dialog.

### Block 3: Modal UI

```jsx
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        {/* Header with close button */}
        <div className="modal-header">...</div>

        {/* QR Code */}
        <div className="qr-wrap" ref={canvasRef}>
          <QRCodeCanvas value={qrValue} size={200} bgColor="#ffffff"
            fgColor="#452829" level="H" includeMargin={false} />
        </div>

        {/* Product info table */}
        <div className="qr-meta">...</div>

        {/* Download & Close buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={handleDownload}>Download PNG</button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
```

- `handleOverlayClick` checks if the click was on the overlay itself (not the box). If yes, it closes the modal. This is implemented with `if (e.target === e.currentTarget) onClose()`.
- `ref={canvasRef}` — Attaches our ref to this div so `handleDownload` can find the canvas.
- `<QRCodeCanvas>` renders an actual HTML canvas with the QR code. `level="H"` means high error correction (the QR code can be 30% damaged and still scan).

---

**Next:** [Part 2 — Dashboard, Products & Sales →](./CODE_WALKTHROUGH_PART2.md)
