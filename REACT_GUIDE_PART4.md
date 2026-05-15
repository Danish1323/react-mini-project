# Part 4 — Viva Q&A Practice (50+ Questions)

> Go through these questions with your team. These are the types of questions an examiner will ask. Each answer references our InvenTrack project.

---

## Section A: React Basics

### Q1: What is React?
**A:** React is an open-source JavaScript library created by Facebook for building user interfaces. It lets us create reusable components and efficiently update the UI when data changes using a Virtual DOM.

### Q2: Is React a framework or a library? What's the difference?
**A:** React is a **library**, not a framework. A framework (like Angular) provides the full structure — routing, HTTP, state management, everything. A library (like React) only handles one job (UI rendering). We chose our own tools: `react-router-dom` for routing, `axios` for HTTP requests, `recharts` for charts.

### Q3: What is a Single Page Application (SPA)?
**A:** An SPA loads one HTML file (`index.html`) and uses JavaScript to dynamically change the content without reloading the page. Our InvenTrack app is an SPA — when you click "Products" in the sidebar, the URL changes but the browser never refreshes. React just swaps which component is displayed.

### Q4: What is the Virtual DOM?
**A:** The Virtual DOM is a lightweight JavaScript copy of the real DOM. When state changes, React updates the Virtual DOM first, compares it with the previous version (called "diffing"), and then only updates the parts of the real DOM that actually changed (called "reconciliation"). This makes updates much faster than manipulating the real DOM directly.

### Q5: What is the difference between the Real DOM and Virtual DOM?
**A:** The Real DOM is the browser's actual HTML structure — updating it is slow because it triggers layout recalculation and repainting. The Virtual DOM is a JavaScript object that React keeps in memory — updating it is fast because it's just changing JavaScript variables. React uses the Virtual DOM to figure out the minimum number of real DOM changes needed.

---

## Section B: JSX

### Q6: What is JSX?
**A:** JSX stands for JavaScript XML. It's a syntax extension that lets us write HTML-like code inside JavaScript. For example, `<div className="card">Hello</div>` is JSX. Behind the scenes, tools like Vite convert JSX into `React.createElement()` calls.

### Q7: Why do we use `className` instead of `class` in JSX?
**A:** Because `class` is a reserved keyword in JavaScript (used for ES6 classes). Since JSX is ultimately JavaScript, we use `className` instead to avoid conflicts.

### Q8: What do curly braces `{}` mean in JSX?
**A:** Curly braces are JavaScript expression escapes. They tell React: "evaluate the code inside as JavaScript, not as plain text." For example, `<h1>{title}</h1>` will display the value of the `title` variable, not the literal word "title".

### Q9: Can JSX return multiple elements?
**A:** No, JSX must return exactly one parent element. If you need to return siblings, wrap them in a `<div>` or use a React Fragment `<> ... </>`. In our `Sidebar.jsx`, we use a Fragment because we need to return both the overlay div and the aside element without adding an extra wrapper div.

---

## Section C: Components & Props

### Q10: What is a component in React?
**A:** A component is a reusable, independent piece of UI. In our project, `StatCard` is a component that displays a single KPI card. `AlertPanel` is a component that displays a single alert row. We define components as JavaScript functions that return JSX.

### Q11: What is the difference between functional and class components?
**A:** Functional components are plain JavaScript functions. Class components use `class MyComponent extends React.Component`. Our entire project uses functional components because they are simpler, and React Hooks (like `useState`) make class components unnecessary in modern React.

### Q12: What are props?
**A:** Props (properties) are inputs passed from a parent component to a child component. They are read-only — the child cannot modify them. In our project, `Dashboard.jsx` passes `label="Total Products"` and `value={13}` as props to the `StatCard` component.

### Q13: Can a child component modify its props?
**A:** No. Props are read-only. This enforces **one-way data flow** — data always flows from parent down to child, never upward. If a child needs to communicate with the parent, the parent passes a function as a prop (like `onClose` in our `QRModal`), and the child calls that function.

### Q14: What is prop destructuring?
**A:** Instead of writing `function StatCard(props)` and accessing `props.label`, we destructure: `function StatCard({ label, value })`. This extracts `label` and `value` directly. It's cleaner and used everywhere in our project.

---

## Section D: State & Hooks

### Q15: What is state in React?
**A:** State is a component's internal memory — data that can change over time. When state changes, React re-renders the component to reflect the new data. We use `useState` to create state variables. For example, `const [loading, setLoading] = useState(true)` creates a boolean that tracks whether data is still being fetched.

### Q16: What is the difference between props and state?
**A:** Props come from outside (parent passes them down) and are read-only. State lives inside the component and can be changed by the component itself. Example: `StatCard` receives `value` as a prop (it can't change it), but `Products` has `showForm` as state (it can toggle it with `setShowForm`).

### Q17: What are Hooks?
**A:** Hooks are special React functions that let functional components use features like state and side effects. The two most common hooks are `useState` (for state) and `useEffect` (for side effects like API calls). They must be called at the top level of a component, never inside conditions or loops.

### Q18: What is `useState`?
**A:** `useState` is a Hook that creates a state variable. It returns an array with two items: the current value and a setter function. Example: `const [search, setSearch] = useState("")` creates a `search` variable starting as an empty string, and `setSearch` is the function to update it.

### Q19: What is `useEffect`?
**A:** `useEffect` is a Hook for running side effects — code that needs to happen outside of just rendering JSX. In our project, we use it to fetch data from the backend when a page loads. Example: in `Transactions.jsx`, `useEffect(() => { getTransactions().then(...) }, [])` fetches transaction logs once when the page mounts.

### Q20: What does the empty dependency array `[]` mean in `useEffect`?
**A:** It means the effect runs only once — when the component first mounts (appears on screen). Without the array, the effect would run after every single render, potentially causing an infinite loop. With `[dark]` in the array (like in our `App.jsx`), it runs whenever the `dark` variable changes.

### Q21: What is a cleanup function in `useEffect`?
**A:** It's a function you return from inside `useEffect`. React calls it when the component unmounts or before re-running the effect. In our `StatCard.jsx`, we use it to clear the `setInterval` timer: `return () => clearInterval(timer)`. Without cleanup, the timer would keep running even after the component disappears, causing a memory leak.

### Q22: What is a custom hook?
**A:** A custom hook is a function whose name starts with `use` that can call other hooks. In our `StatCard.jsx`, `useCountUp` is a custom hook that animates a number counting up from 0 to the target value. It uses `useState` and `useEffect` internally.

---

## Section E: Events & Forms

### Q23: How do you handle a click event in React?
**A:** Using the `onClick` prop. Example: `<button onClick={handleDelete}>Delete</button>`. Note: we pass the function reference (`handleDelete`), not a function call (`handleDelete()`).

### Q24: Why do we call `e.preventDefault()` in form submissions?
**A:** By default, HTML forms reload the entire page when submitted. In a React SPA, reloading destroys all state. `e.preventDefault()` stops the browser's default behavior so we can handle the submission ourselves with JavaScript.

### Q25: What is a controlled component?
**A:** A form input whose value is controlled by React state. The input always displays what's in state, and user typing updates the state via `onChange`. Example: `<input value={form.name} onChange={handleChange} />`. This gives us full control over validation and formatting.

### Q26: How does the spread operator `...` work in state updates?
**A:** `setForm({ ...form, name: "Rice" })` creates a new object by copying all existing fields from `form` and then overriding just the `name` field. We can't mutate state directly in React — we always create a new object.

---

## Section F: Lists, Keys & Conditional Rendering

### Q27: How do you render a list in React?
**A:** Using the JavaScript `.map()` method. We loop over an array and return JSX for each item. Example: `{products.map((p) => <tr key={p.id}><td>{p.name}</td></tr>)}`.

### Q28: Why is the `key` prop required when rendering lists?
**A:** React uses keys to identify which items changed, were added, or removed. Without keys, React would have to re-render the entire list on every change. With keys (like database IDs), React can surgically update only the changed items.

### Q29: Why shouldn't you use array index as a key?
**A:** Because if items are reordered, inserted, or deleted, the indices shift. React would mistakenly think items changed when they didn't, causing visual bugs and poor performance. Always use stable, unique identifiers like `id`.

### Q30: What is conditional rendering? Give three methods.
**A:** It means showing/hiding UI based on conditions. Three methods: (1) `&&` operator — `{isLow && <span>Low</span>}`; (2) Ternary — `{dark ? <Sun /> : <Moon />}`; (3) Early return — `if (loading) return <div>Loading...</div>`. We use all three in our project.

---

## Section G: Routing

### Q31: What is React Router?
**A:** React Router (`react-router-dom`) is a library that enables client-side routing in SPAs. It maps URLs to components without reloading the page.

### Q32: What is `BrowserRouter`?
**A:** It's the top-level component that enables routing. It wraps the entire app in `App.jsx`. It uses the browser's history API to sync the URL with the displayed component.

### Q33: What is the difference between `<NavLink>` and `<a href>`?
**A:** `<a href>` causes a full page reload. `<NavLink>` intercepts the click and changes the URL using JavaScript — no reload. `NavLink` also has an `isActive` property that tells us if the user is currently on that page, which we use to highlight the active sidebar item.

### Q34: What does `<Route path="/products" element={<Products />} />` do?
**A:** When the URL is `/products`, React Router renders the `Products` component inside the `<Routes>` container. All other routes are hidden.

---

## Section H: API & Data Fetching

### Q35: What is Axios?
**A:** Axios is a JavaScript library for making HTTP requests. We use it to communicate with our FastAPI backend. We created a centralized API instance in `api.js` with a base URL so we don't repeat it in every call.

### Q36: What is the difference between GET, POST, DELETE, and PATCH?
**A:** GET retrieves data (`getProducts`). POST creates new data (`addProduct`). DELETE removes data (`deleteProduct`). PATCH partially updates data (`restockProduct` — adds stock without replacing the entire product).

### Q37: What is a Promise?
**A:** A Promise represents an operation that hasn't completed yet but will in the future. It has three states: pending (waiting), fulfilled (success), rejected (error). We handle them with `.then()` for success, `.catch()` for errors, and `.finally()` for cleanup.

### Q38: What is `async`/`await`?
**A:** It's a cleaner syntax for working with Promises. `async` marks a function as asynchronous. `await` pauses execution until a Promise resolves. We use it in `handleAdd` in `Products.jsx`: `await addProduct(payload)`.

### Q39: What is `Promise.all`?
**A:** It takes multiple promises and waits for ALL of them to resolve. We use it to fetch products and suppliers simultaneously: `Promise.all([getProducts(), getSuppliers()])`. This is faster than fetching them one after another.

---

## Section I: Styling & CSS

### Q40: What are CSS Custom Properties (Variables)?
**A:** They're reusable values defined with `--name: value` and used with `var(--name)`. We define all our colors in `:root` (like `--primary: #FF5722`) and use them throughout the CSS. Changing one variable updates every element that uses it.

### Q41: How does dark mode work in your project?
**A:** We define two sets of CSS variables — one in `:root` (light mode) and one in `body.dark` (dark mode). When the user clicks the toggle, React adds the `dark` class to `<body>` using `document.body.classList.toggle("dark", dark)`. The CSS variables are instantly overridden, and every element using `var(--text)` or `var(--bg)` switches color.

### Q42: What is Neo-Brutalism in web design?
**A:** It's a design style characterized by hard solid borders, blocky drop shadows, bold colors, and a raw, structural feel. In our CSS: `border: 2px solid var(--border)` and `box-shadow: 4px 4px 0 var(--border)`. We combine it with Glassmorphism (`backdrop-filter: blur(16px)` and semi-transparent backgrounds) for a modern, premium look.

---

## Section J: Project-Specific Questions

### Q43: How many pages does your app have?
**A:** Six pages: Dashboard, Products, Suppliers, Sales, Transactions, and Reports. Each is a separate React component in the `pages/` folder, rendered by React Router based on the URL.

### Q44: How does the search filter work on the Products page?
**A:** We have a `search` state variable. When the user types, `onChange` updates the state. We then filter the `products` array using `.filter()`: `products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))`. React re-renders and only the matching rows are displayed. No backend call needed — it's purely client-side.

### Q45: How does the real-time sale preview work?
**A:** When the user selects a product and types a quantity in the Sales form, we compute the preview in real-time using derived values (not state): `const previewRevenue = selectedProduct.selling_price * qty`. This is recalculated on every render automatically because it's derived from state values that change.

### Q46: What is the QR code feature?
**A:** Each product has a QR button. Clicking it opens a modal (`QRModal.jsx`) that uses the `qrcode.react` library to generate a QR code containing the product's name, SKU, category, and quantity as a JSON string. Users can also download it as a PNG.

### Q47: How does the animated counter on stat cards work?
**A:** `StatCard.jsx` has a custom hook called `useCountUp`. It uses `setInterval` to increment a display value from 0 to the target in 40 steps over 900ms. The cleanup function (`return () => clearInterval(timer)`) prevents memory leaks.

### Q48: What libraries did you install for this project?
**A:** `react` and `react-dom` (core), `react-router-dom` (routing), `axios` (HTTP requests), `recharts` (charts), `lucide-react` (icons), `qrcode.react` (QR codes). These are all listed in `package.json`.

### Q49: What is `localStorage` and how do you use it?
**A:** `localStorage` is a browser API that stores key-value pairs permanently (survives page refreshes and browser restarts). We use it to save the user's dark mode preference: `localStorage.setItem("theme", "dark")`. On page load, we read it: `localStorage.getItem("theme")`.

### Q50: Explain the full data flow when a user records a sale.
**A:**
1. User selects a product from the dropdown and enters a quantity
2. Client-side validation checks if the quantity exceeds available stock
3. `handleRecord` calls `e.preventDefault()` to stop page reload
4. `await recordSale({ product_id, quantity_sold })` sends a POST request to the FastAPI backend
5. The backend validates, creates a sale record, reduces product stock, logs the transaction, and returns the sale data
6. On success, we call `loadData()` which refetches all sales and products from the backend
7. React sees the state changed and re-renders the page with the updated data

---

## Bonus: Common Mistakes to Avoid

1. **Forgetting `key` in `.map()`** → React shows a yellow warning
2. **Calling a function in `onClick`** → `onClick={fn()}` runs immediately, use `onClick={fn}` or `onClick={() => fn(arg)}`
3. **Mutating state directly** → `products.push(newProduct)` is WRONG. Use `setProducts([...products, newProduct])`
4. **Missing dependency array in useEffect** → Causes infinite loops
5. **Using `class` instead of `className`** → JSX requires `className`

---

> **You've completed the entire study guide. You now understand every React concept used in InvenTrack. Walk into that viva with confidence! 🚀**
