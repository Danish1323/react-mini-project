# Part 2 — State, Hooks, Events & Forms

> This part covers: What is State, What are Hooks, useState in depth, useEffect in depth, Event Handling, Controlled Forms, async/await

---

## Chapter 7: What is State?

**State** is the "memory" of a component. It's data that can change over time and when it changes, React automatically redraws that component on the screen.

### Why can't we just use normal JavaScript variables?

```javascript
// ❌ THIS DOES NOT WORK IN REACT
function Counter() {
  let count = 0;

  function handleClick() {
    count = count + 1;       // This changes the variable...
    console.log(count);       // This prints the new value...
  }

  return (
    <div>
      <p>Count: {count}</p>  {/* ...but the screen still shows 0! */}
      <button onClick={handleClick}>Add</button>
    </div>
  );
}
```

**Why doesn't this work?** Because React has no idea that `count` changed. React only redraws the screen when you tell it to. Normal variables don't trigger a redraw.

### The solution: `useState`

```javascript
// ✅ THIS WORKS
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  //     ↑        ↑                  ↑
  //  current   function to      initial
  //  value     update it        value

  function handleClick() {
    setCount(count + 1);  // This tells React: "the count changed, please redraw!"
  }

  return (
    <div>
      <p>Count: {count}</p>   {/* Now this updates on screen! */}
      <button onClick={handleClick}>Add</button>
    </div>
  );
}
```

**How `useState` works step by step:**
1. `useState(0)` — We tell React: "I want to remember a value. Start it at 0."
2. React returns an array with two items: `[currentValue, updaterFunction]`
3. We use **array destructuring** to name them: `const [count, setCount] = ...`
4. `count` — always holds the current value
5. `setCount(newValue)` — when called, it:
   - Updates the stored value
   - Tells React to **re-render** (redraw) the component with the new value

### Multiple State Variables

A component can have many state variables. Here's our actual `Products.jsx`:

```javascript
function Products() {
  const [products, setProducts]   = useState([]);     // Array of products from DB
  const [suppliers, setSuppliers] = useState([]);     // Array of suppliers from DB
  const [loading, setLoading]     = useState(true);   // Is data still loading?
  const [search, setSearch]       = useState("");     // What the user typed in search
  const [category, setCategory]   = useState("All");  // Selected filter category
  const [showForm, setShowForm]   = useState(false);  // Is the add-product form visible?
  const [message, setMessage]     = useState(null);   // Success/error message to show
  const [qrProduct, setQrProduct] = useState(null);   // Which product's QR to show
  // ...
}
```

Each `useState` call creates an independent piece of memory. Changing one does not affect the others.

### State with Objects

Sometimes state is a whole object (like a form with many fields). Here's from `Products.jsx`:

```javascript
const [form, setForm] = useState({
  name: "",
  sku: "",
  category: "",
  quantity: "",
  cost_price: "",
  selling_price: "",
  reorder_level: "10",
  supplier_id: "",
  expiry_date: "",
  restock_date: "",
});
```

To update just one field of this object, we use the **spread operator** (`...`):

```javascript
function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
  //        ↑                ↑              ↑
  //    Copy all        Which field     New value of
  //    existing        changed?        that field
  //    fields
}
```

**What `...form` does:** It copies every key-value pair from the current `form` object into a new object. Then `[e.target.name]: e.target.value` overwrites just the one field that the user is currently typing in. We need to copy because React state should never be modified directly (mutated) — always create a new object.

---

## Chapter 8: What are Hooks?

**Hooks** are special functions provided by React that let you "hook into" React's features from inside a functional component.

### Why are they called "Hooks"?

Think of it this way: A regular JavaScript function knows nothing about React. But when you use a Hook inside your component, you're "hooking" your function into React's internal system — its state management, its lifecycle, its DOM updates.

### The Hooks we use in our project:

| Hook | What it does | Where we use it |
|------|-------------|-----------------|
| `useState` | Remembers data that changes over time | Every page and most components |
| `useEffect` | Runs code at specific moments (like "when page loads") | Every page that fetches data from backend |
| `useLocation` | Tells you the current URL path | `App.jsx` to show the right page title |

### Rules of Hooks (IMPORTANT for viva!)

1. **Only call Hooks at the top level** — Never inside an `if`, `for`, or nested function.
2. **Only call Hooks inside React components** — You can't use `useState` in a regular JavaScript file.

```javascript
// ❌ WRONG — Hook inside a condition
function Products() {
  if (true) {
    const [data, setData] = useState([]);  // ILLEGAL!
  }
}

// ✅ CORRECT — Hook at the top level
function Products() {
  const [data, setData] = useState([]);    // Always at the top
  // ...
}
```

---

## Chapter 9: `useEffect` — Running Side Effects

### What is a Side Effect?

A React component's main job is to **return JSX** (draw the UI). Anything else is a "side effect":
- Fetching data from an API
- Setting up a timer
- Reading/writing to `localStorage`
- Changing the document title
- Adding/removing a CSS class from `<body>`

### The Syntax

```javascript
useEffect(() => {
  // Code to run (the "effect")
}, [dependencies]);
```

It takes TWO arguments:
1. **A function** — the code you want to run
2. **A dependency array** — controls WHEN the code runs

### When does it run?

| Dependency Array | When the Effect Runs |
|-----------------|---------------------|
| `[]` (empty array) | **Once** — when the component first appears on screen (called "mounting") |
| `[dark]` (with a value) | Once on mount, AND every time `dark` changes |
| No array at all | After **every single render** (almost never what you want!) |

### Real example 1: Fetching data on page load

From our `Transactions.jsx`:

```javascript
function Transactions() {
  const [transactions, setTransactions] = useState([]);  // Start with empty array
  const [loading, setLoading] = useState(true);          // Start in loading state

  useEffect(() => {
    // This function runs ONCE when the Transactions page first loads
    getTransactions()                    // Call our Python backend API
      .then((res) => {                   // When the data comes back...
        setTransactions(res.data);       // Save it to state
      })
      .catch(() => {                     // If something goes wrong...
        alert("Could not load transactions.");
      })
      .finally(() => {                   // Whether success or failure...
        setLoading(false);               // Stop showing "Loading..."
      });
  }, []);  // ← Empty array = run this ONLY ONCE
```

**Step by step what happens:**
1. Component renders for the first time with `transactions = []` and `loading = true`
2. The screen shows "Loading logs..."
3. `useEffect` fires and calls `getTransactions()` (which sends a GET request to `http://localhost:8000/transactions/`)
4. The backend responds with an array of transaction objects
5. `setTransactions(res.data)` saves those transactions to state
6. `setLoading(false)` turns off the loading indicator
7. React sees that state changed, so it **re-renders** the component
8. Now `transactions` has data, and `loading` is false, so the table is drawn

### Real example 2: Reacting to state changes

From our `App.jsx`:

```javascript
const [dark, setDark] = useState(
  () => localStorage.getItem("theme") === "dark"
);

useEffect(() => {
  document.body.classList.toggle("dark", dark);   // Add/remove "dark" class from <body>
  localStorage.setItem("theme", dark ? "dark" : "light");  // Save preference
}, [dark]);  // ← Runs every time `dark` changes!
```

**What happens:**
1. When the user clicks the Moon/Sun icon, `setDark(!dark)` is called
2. `dark` changes from `false` to `true` (or vice versa)
3. Because `[dark]` is in the dependency array, React runs the `useEffect` again
4. It adds the CSS class `"dark"` to `<body>`, which triggers all our dark-mode CSS variables
5. It also saves `"dark"` to `localStorage` so the preference survives page refreshes

### Cleanup Function

Sometimes you need to "clean up" after an effect. For example, if you start a timer, you need to stop it when the component disappears. From `StatCard.jsx`:

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    // Count up animation logic...
  }, interval);

  return () => clearInterval(timer);  // ← CLEANUP FUNCTION
  //  ↑ This runs when the component is removed from the screen
}, [target, duration]);
```

The function you `return` from inside `useEffect` is called the **cleanup function**. React calls it:
- Before running the effect again (if dependencies changed)
- When the component is removed from the screen ("unmounting")

---

## Chapter 10: Event Handling

### How events work in React

In plain HTML:
```html
<button onclick="handleClick()">Click</button>
```

In React JSX:
```javascript
<button onClick={handleClick}>Click</button>
```

**Key differences:**
1. `onclick` → `onClick` (camelCase in React)
2. `"handleClick()"` (string) → `{handleClick}` (JavaScript reference — no parentheses!)

### Why no parentheses?

```javascript
// ❌ WRONG — This runs handleClick IMMEDIATELY when the page loads, not on click
<button onClick={handleClick()}>Click</button>

// ✅ CORRECT — This passes the function itself, React will call it when clicked
<button onClick={handleClick}>Click</button>
```

### Passing arguments to event handlers

What if you need to pass an argument? You wrap it in an **arrow function**:

```javascript
// From Products.jsx — deleting a specific product
<button onClick={() => handleDelete(p.id, p.name)}>
  Delete
</button>
```

The `() =>` creates a new mini-function that React will call on click. Inside that mini-function, we call `handleDelete` with the specific product's ID and name.

### The Event Object (`e`)

When an event fires, React passes an **event object** (`e`) to your handler:

```javascript
// From Products.jsx — handling search input
<input
  type="text"
  placeholder="Search by name or SKU..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  //        ↑          ↑         ↑
  //    event      update    the actual text
  //    object     state     the user typed
/>
```

- `e` — the event object (React provides this automatically)
- `e.target` — the HTML element that triggered the event (the `<input>` tag)
- `e.target.value` — the current text inside that input
- `e.target.name` — the `name` attribute of the input (useful for forms with many fields)

### `e.preventDefault()`

In HTML, forms automatically refresh the page when submitted. We DON'T want that in React (it would erase all our state!). So we call `e.preventDefault()`:

```javascript
// From Products.jsx
async function handleAdd(e) {
  e.preventDefault();  // ← STOP the browser from refreshing the page!
  
  // Now we handle the form submission ourselves using JavaScript
  await addProduct(payload);
  loadData();
}
```

---

## Chapter 11: Controlled Forms & Two-Way Binding

### What is a Controlled Component?

In a **controlled** form, React state is the "single source of truth" for every input field. The input always displays what's in state, and typing updates the state.

```javascript
// From Products.jsx
const [form, setForm] = useState({ name: "", sku: "" });

// The input's value is ALWAYS whatever is in state
<input
  name="name"
  value={form.name}                        // Display what's in state
  onChange={(e) => setForm({               // When user types...
    ...form,                               // keep all other fields
    [e.target.name]: e.target.value        // update THIS field
  })}
/>
```

**The cycle:**
1. User types "R" → `onChange` fires → `setForm({ name: "R", sku: "" })` → React redraws → input shows "R"
2. User types "i" → `onChange` fires → `setForm({ name: "Ri", sku: "" })` → React redraws → input shows "Ri"
3. And so on...

This may seem circular, but it gives us total control. We can validate, format, or reject input at any point.

### Dynamic `name` attribute trick

Notice `[e.target.name]: e.target.value`. The square brackets `[]` mean "use the VALUE of `e.target.name` as the key". So if the input has `name="sku"`, it's equivalent to writing `{ sku: e.target.value }`. This lets us use ONE handler for ALL fields!

From our `Products.jsx`:
```javascript
function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
}

// Then every input uses the same handler:
<input name="name" value={form.name} onChange={handleChange} />
<input name="sku" value={form.sku} onChange={handleChange} />
<input name="category" value={form.category} onChange={handleChange} />
// All three inputs use the same handleChange function!
```

---

## Chapter 12: Async/Await and Promises

### What is a Promise?

When your frontend asks the backend for data (`getProducts()`), the data doesn't arrive instantly — it takes time (maybe 200ms). A **Promise** is JavaScript's way of saying "I don't have the answer yet, but I promise I'll get back to you."

A Promise has three states:
1. **Pending** — Still waiting for the response
2. **Fulfilled** — The data arrived successfully
3. **Rejected** — Something went wrong (server down, network error, etc.)

### Using `.then()` and `.catch()`

```javascript
// From Transactions.jsx
getTransactions()                  // Returns a Promise (pending...)
  .then((res) => {                 // When fulfilled (success):
    setTransactions(res.data);     //   save the data
  })
  .catch(() => {                   // When rejected (error):
    alert("Could not load.");      //   show error
  })
  .finally(() => {                 // Always runs (success OR error):
    setLoading(false);             //   stop the loading spinner
  });
```

### Using `async`/`await` (modern alternative)

`async`/`await` is a cleaner way to write the same thing:

```javascript
// From Products.jsx
async function handleAdd(e) {      // "async" means: this function uses await
  e.preventDefault();

  try {
    await addProduct(payload);     // "await" means: PAUSE here until the promise resolves
    showMsg("Product added!");
    loadData();
  } catch (err) {                  // If the promise was rejected:
    showMsg("Failed to add.", "error");
  }
}
```

Both `.then()/.catch()` and `async/await` do the exact same thing. `async/await` just looks cleaner and more like normal code.

---

## End of Part 2

You now understand:
- ✅ What State is and why normal variables don't work
- ✅ How `useState` works with primitives and objects
- ✅ What Hooks are and their rules
- ✅ How `useEffect` runs side effects (data fetching, localStorage, DOM changes)
- ✅ How dependency arrays control when effects run
- ✅ How events work in React (onClick, onChange, onSubmit)
- ✅ What controlled forms are and how two-way binding works
- ✅ What Promises and async/await are

**Next:** [Part 3 — Lists, Conditional Rendering, Routing, API & CSS →](./REACT_GUIDE_PART3.md)
