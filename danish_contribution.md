# Danish's React Contribution Breakdown (50%)

Welcome! This document outlines the 50% of the frontend React code written by **Danish** for the InvenTrack project. 

Because I led the core architecture of the project, this section covers the complex page logic (Dashboard, Products, Reports), the API integration layer, the routing system, and the entire custom Neo-Brutalist CSS design system.

---

## 1. App Routing & Layout
**File:** `frontend/src/App.jsx`

In a traditional website, clicking a link loads a whole new HTML page. In a **Single Page Application (SPA)** like React, we use a router to fake different pages while staying on the exact same HTML file!

### The Code
```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Header theme={theme} toggleTheme={toggleTheme} />
          <div className="scroll-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
```

### Explanation
- **`<Router>` and `<Routes>`**: This controls the URL. If the user goes to `/products`, React looks at the `<Route path="/products">` and decides to draw the `<Products />` component onto the screen.
- **Theme Memory**: We use `localStorage` to save the user's Dark Mode preference directly inside their browser. When they reload the page tomorrow, it will still be dark!

---

## 2. Centralized API Client
**File:** `frontend/src/api/api.js`

To talk to the Python FastAPI backend, we use a library called `axios`.

### The Code
```javascript
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
});

export const getProducts = () => API.get("/products/");
export const restockProduct = (id, quantity_added) => API.patch(`/products/${id}/restock`, { quantity_added });
```

### Explanation
- Instead of typing `"http://localhost:8000/products/"` inside every single page, we created a single `API` instance. If the backend URL changes (like when we deploy it to Railway), we only have to change it in one place!
- `API.get` fetches data. `API.patch` modifies existing data (like updating stock).

---

## 3. The `Products` Page (Full CRUD)
**File:** `frontend/src/pages/Products.jsx`

This is the most complex page. It allows the user to Create, Read, Update, and Delete products (CRUD).

### Adding a Product
```javascript
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", quantity: 0, cost_price: 0 });

  const handleAdd = (e) => {
    e.preventDefault();
    addProduct(form).then(() => {
      setFormOpen(false); // Close the form
      loadData();         // Re-fetch the database
    });
  };
```
### Explanation
- We keep a boolean `formOpen`. If it's `false`, we just show an "Add Product" button. If `true`, we draw the massive HTML form.
- The `form` object in `useState` acts as a giant dictionary holding whatever the user is typing into the inputs.

---

## 4. The `Dashboard` & AI Insights
**File:** `frontend/src/pages/Dashboard.jsx`

This page runs multiple background requests at once to assemble a bird's-eye view of the business.

### Promise.all()
```javascript
  useEffect(() => {
    Promise.all([getDashboard(), getInsights()])
      .then(([dRes, iRes]) => {
        setData(dRes.data);
        setInsights(iRes.data);
      });
  }, []);
```
### Explanation
- **`Promise.all`**: Imagine sending two waiters to the kitchen to fetch two different meals. Instead of serving them one by one, `Promise.all` waits for both waiters to return, and serves them to the table at the exact same time! This makes the page load incredibly fast.

### Inline Restock Feature
```javascript
  const handleRestock = async (id, name) => {
    const qtyStr = prompt(`How many units of "${name}" do you want to restock?`);
    const qty = parseInt(qtyStr, 10);
    await restockProduct(id, qty);
  };
```
- We built a custom inline modal that allows managers to instantly click "Restock" directly from the warning panel without navigating away.

---

## 5. The Neo-Brutalist CSS Design System
**File:** `frontend/src/index.css`

I wrote the entire UI from scratch using pure vanilla CSS. I chose a modern "Neo-Brutalist" mixed with "Glassmorphism" theme.

### The Code
```css
:root {
  --bg:            #F4F0EC;
  --primary:       #FF5722;
  --border:        #0A0A0A;
  --neo-shadow:    4px 4px 0 var(--border);
}

.card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  border: 2px solid var(--border);
  box-shadow: var(--neo-shadow);
  border-radius: 12px;
  transition: transform 0.2s;
}

.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--border);
}
```

### Explanation
- **CSS Variables (`:root`)**: Variables let us define our color palette once. If I want to change the primary orange color to purple, I only change it on line 7!
- **Neo-Brutalism**: Achieved by combining `2px solid` hard dark borders with a hard, unblurred drop shadow (`4px 4px 0`).
- **Glassmorphism**: Achieved using `backdrop-filter: blur(16px)` combined with a semi-transparent white background (`rgba 0.65`).
- **Interactivity (`:hover`)**: When you hover your mouse over a card, we use `transform: translate(-2px, -2px)` to literally move the card 2 pixels up and left, whilst making the shadow bigger. This makes the UI feel tactile and "clickable"!
