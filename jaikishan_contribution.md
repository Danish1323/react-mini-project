# Jaikishan's React Contribution Breakdown (25%)

Welcome! This document outlines the 25% of the frontend React code written by **Jaikishan** for the InvenTrack project. 

This section covers the core pages of our application: the **Suppliers** list, the **Sales** entry system, and the **Transactions** audit log.

If you are new to React, we will break down the fundamental concepts like `useState` and `useEffect` below.

## What are React Hooks?
React Components are normally "dumb" — they just draw what you tell them. To make them "smart", we use **Hooks**:
- **`useState`**: Think of this as the component's memory. It remembers data (like "what did the user type in the text box?"). If the state changes, React automatically redraws the screen!
- **`useEffect`**: Think of this as a side-effect trigger. It tells React: "When this page first loads, go talk to the backend database and fetch my data."

---

## 1. The `Transactions` Page
**File:** `frontend/src/pages/Transactions.jsx`

This page is responsible for showing a table of all the activity happening in the system (like when a product is added or sold).

### The Core Logic
```javascript
import { useState, useEffect } from "react";
import { getTransactions } from "../api/api";
import { Activity } from "lucide-react";

function Transactions() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then((res) => setLogs(res.data))
      .catch(() => alert("Error fetching logs"))
      .finally(() => setLoading(false));
  }, []);
```

### Explanation
- **`const [logs, setLogs] = useState([]);`**: We are creating a memory variable called `logs`. We start it off as an empty list `[]`. The `setLogs` is a special function we call when we want to update the memory.
- **`useEffect(() => { ... }, []);`**: The empty `[]` at the end means "Run this code exactly once when the page opens."
- **`getTransactions().then(...)`**: We call our backend API to get the logs. When the backend replies, we use `setLogs(res.data)` to save the logs into memory. React sees the memory changed and redraws the page to show the table!

### Drawing the Table (JSX)
```javascript
  return (
    <div className="page-content">
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Product</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString("en-IN")}</td>
                <td><span className="badge badge-ok">{log.action}</span></td>
                <td>{log.product_name || "—"}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Explanation
- **`logs.map((log) => ...)`**: This is how we draw lists in React! We take our array of `logs` and "map" (loop) over each one, creating an HTML table row `<tr>` for each log.
- **`key={log.id}`**: React requires every item in a list to have a unique `key`. This helps React efficiently update the list if a single row changes.

---

## 2. The `Sales` Page
**File:** `frontend/src/pages/Sales.jsx`

This page contains a form where cashiers can record a new sale.

### The Core Logic
```javascript
  const [form, setForm] = useState({ product_id: "", quantity_sold: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity_sold) return alert("Fill all fields");

    const qty = parseInt(form.quantity_sold, 10);
    
    // Find the product they selected from the dropdown
    const prod = products.find((p) => p.id === parseInt(form.product_id));
    
    if (prod && qty > prod.quantity) {
      return alert(`Insufficient stock. Only ${prod.quantity} unit(s) available.`);
    }

    addSale({ product_id: form.product_id, quantity_sold: qty })
      .then(() => {
        setForm({ product_id: "", quantity_sold: "" }); // Clear the form
        loadData(); // Refresh the list
      });
  };
```

### Explanation
- **`e.preventDefault();`**: Normally, when you submit an HTML form, the browser refreshes the page. We don't want that! This line stops the default refresh.
- **Client-Side Validation**: Before talking to the backend, we check if the user is trying to sell more items than we actually have in stock (`qty > prod.quantity`). This creates a snappy user experience because the error pops up instantly!
- **`addSale(...).then(...)`**: We send the new sale to the backend. If it succeeds, we clear the form out.

---

## 3. The `Suppliers` Page
**File:** `frontend/src/pages/Suppliers.jsx`

This page lists all the companies that supply our inventory. Instead of a table, it uses a visual "Card Grid" layout.

### The Code
```javascript
<div className="card-grid">
  {suppliers.map((sup) => (
    <div key={sup.id} className="card">
      <div className="card-header">
        <h3>{sup.name}</h3>
        <button className="icon-btn" onClick={() => handleDelete(sup.id)}>
          <Trash2 size={16} color="var(--danger)" />
        </button>
      </div>
      <div className="card-body">
        <p><strong>Contact:</strong> {sup.contact_person}</p>
        <p><strong>Phone:</strong> {sup.phone}</p>
        <p><strong>Email:</strong> {sup.email}</p>
      </div>
    </div>
  ))}
</div>
```

### Explanation
- Instead of drawing a `<table>`, we loop through the `suppliers` array and draw a beautiful `<div className="card">` for each supplier.
- The trash can button calls `onClick={() => handleDelete(sup.id)}`. Notice the `() =>`? If we just wrote `onClick={handleDelete(sup.id)}`, React would accidentally delete the supplier the second the page loads! By wrapping it in a function, we tell React to *wait* until the user actually clicks the button.
