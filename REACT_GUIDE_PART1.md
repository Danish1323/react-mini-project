# Part 1 — React Foundations (Start Here)

> This part covers: What is React, How a React project is created, What is JSX, What are Components, What are Props

---

## Chapter 1: What is JavaScript?

Before we talk about React, let's be clear about JavaScript (JS). JavaScript is the programming language that makes websites interactive. HTML creates the structure (headings, paragraphs, tables). CSS makes it look pretty (colors, fonts, spacing). JavaScript makes it *do things* (when you click a button, something happens).

React is written *in* JavaScript. So everything you see in a `.jsx` file is actually JavaScript with some special syntax on top.

---

## Chapter 2: What is React?

**React** is a free, open-source **JavaScript library** created by Facebook (now Meta) in 2013. Its only job is to help you build **User Interfaces** (the visual part of a website that users see and interact with).

### Why was React created?

Imagine you're building a chat app. When a new message arrives, you need to:
1. Add the message to the chat window
2. Update the unread count badge
3. Maybe show a notification

Without React, you'd have to manually find each HTML element and update it with raw JavaScript. This gets incredibly messy and buggy as the app grows.

React solves this: **You just tell React what the screen should look like given some data, and React figures out how to update the screen efficiently.**

### Key terms you MUST know for viva:

**1. Library vs Framework**
- A **Library** (React) = A toolbox. You pick which tools you want to use, and you're in control.
- A **Framework** (Angular, Django) = A blueprint. It tells you how to structure everything and you follow its rules.
- React is a library because it only handles the UI. For routing (page navigation), we added `react-router-dom`. For HTTP requests, we added `axios`. We chose these ourselves.

**2. Single Page Application (SPA)**
- A traditional website (like Wikipedia) loads a completely new HTML page from the server every time you click a link. You see the browser tab loading each time.
- An SPA (like our InvenTrack app) loads **one single HTML file** (`index.html`) and then uses JavaScript to swap content on the screen when you navigate. The page never actually refreshes!
- **In our project**: When you click "Products" in the sidebar, the browser URL changes to `/products`, but the page doesn't reload. React just removes the Dashboard component and draws the Products component instead.

**3. The DOM (Document Object Model)**
- When a browser loads an HTML file, it creates a tree-like structure in memory called the DOM. Each HTML tag (`<div>`, `<h1>`, `<button>`) becomes a "node" in this tree.
- Changing the DOM directly (adding/removing elements) is **slow** because the browser has to recalculate layouts, repaint pixels, etc.

**4. The Virtual DOM**
- React keeps its own lightweight copy of the DOM in memory, called the **Virtual DOM**.
- When something changes (e.g., a product is deleted), React:
  1. Updates the Virtual DOM first (this is fast, it's just JavaScript objects in memory)
  2. Compares the new Virtual DOM with the old one (this is called **"diffing"**)
  3. Only updates the specific parts of the Real DOM that actually changed (this is called **"reconciliation"**)
- This is why React apps feel so fast and smooth.

---

## Chapter 3: How a React Project is Created and Structured

### Step 1: Creating the project

We used a tool called **Vite** (pronounced "veet", French for "fast"). The command is:

```bash
npm create vite@latest frontend -- --template react
```

This creates a folder called `frontend/` with all the starter files pre-configured.

> **What is npm?** npm stands for Node Package Manager. It's a tool that lets you download and install JavaScript libraries (like React, Axios, etc.) from the internet. Think of it like an app store for JavaScript code.

### Step 2: Installing dependencies

```bash
cd frontend
npm install
```

This reads the `package.json` file and downloads all required libraries into a folder called `node_modules/`.

### Step 3: Running the project

```bash
npm run dev
```

This starts a local development server (usually at `http://localhost:5173`). Every time you save a file, Vite automatically refreshes the browser — this is called **Hot Module Replacement (HMR)**.

### The File Structure of Our Project

```
frontend/
├── index.html          ← The ONE and ONLY HTML file in the entire app
├── package.json        ← Lists all installed libraries and project scripts
├── vite.config.js      ← Configuration for the Vite build tool
├── node_modules/       ← Downloaded library code (never edit this!)
└── src/                ← ALL of our custom code lives here
    ├── main.jsx        ← The entry point — where React starts
    ├── App.jsx         ← The root component — the "skeleton" of the app
    ├── index.css       ← All our styles (CSS)
    ├── api/
    │   └── api.js      ← Functions to talk to the Python backend
    ├── components/     ← Small, reusable UI pieces
    │   ├── Sidebar.jsx
    │   ├── Header.jsx
    │   ├── StatCard.jsx
    │   ├── AlertPanel.jsx
    │   └── QRModal.jsx
    └── pages/          ← Full page-level components
        ├── Dashboard.jsx
        ├── Products.jsx
        ├── Suppliers.jsx
        ├── Sales.jsx
        ├── Transactions.jsx
        └── Reports.jsx
```

### The Entry Point: `main.jsx`

This is the very first file that runs. Let's look at our actual code:

```javascript
// File: frontend/src/main.jsx

import { StrictMode } from 'react'          // Line 1
import { createRoot } from 'react-dom/client' // Line 2
import './index.css'                          // Line 3
import App from './App.jsx'                   // Line 4

createRoot(document.getElementById('root')).render(  // Line 5
  <StrictMode>                                        // Line 6
    <App />                                           // Line 7
  </StrictMode>,                                      // Line 8
)
```

**Line-by-line breakdown:**
- **Line 1**: `import { StrictMode } from 'react'` — StrictMode is a React wrapper that helps catch bugs during development. It doesn't do anything in production.
- **Line 2**: `import { createRoot } from 'react-dom/client'` — `createRoot` is the function that connects React to the actual HTML page.
- **Line 3**: `import './index.css'` — This loads our entire stylesheet.
- **Line 4**: `import App from './App.jsx'` — This imports our main App component (the root of everything).
- **Line 5**: `document.getElementById('root')` — In our `index.html`, there is a single empty `<div id="root"></div>`. This line finds that div.
- **Line 5 continued**: `.render(...)` — This tells React: "Take the `<App />` component and draw it inside that root div."
- **Line 7**: `<App />` — This is our entire application! Everything starts here.

**The key insight**: Our `index.html` has literally nothing in the `<body>` except `<div id="root"></div>`. React fills that div with our entire application using JavaScript!

---

## Chapter 4: What is JSX?

**JSX** stands for **JavaScript XML**. It is a special syntax that lets you write HTML-like code directly inside JavaScript files.

### Without JSX (ugly, hard to read):
```javascript
// Creating a button using raw JavaScript
const button = React.createElement('button', { onClick: handleClick }, 'Click Me');
```

### With JSX (clean, intuitive):
```javascript
// Same button, but written in JSX
const button = <button onClick={handleClick}>Click Me</button>;
```

Both produce the exact same result! JSX is just **syntactic sugar** — it makes the code easier to write and read. Behind the scenes, Vite converts all JSX into `React.createElement()` calls before the browser sees it.

### JSX Rules You Must Know:

**Rule 1: Use `className` instead of `class`**
```javascript
// ❌ WRONG — "class" is a reserved word in JavaScript
<div class="card">Hello</div>

// ✅ CORRECT — Use "className" in JSX
<div className="card">Hello</div>
```
**In our project**, every single CSS class is applied using `className`. Example from `Dashboard.jsx`:
```javascript
<div className="page-content">
  <div className="stat-grid">
```

**Rule 2: Use `{}` curly braces to inject JavaScript into JSX**
```javascript
const name = "InvenTrack";

// The curly braces tell React: "evaluate this as JavaScript, not text"
<h1>{name}</h1>  // Renders: InvenTrack

// Without curly braces, it would literally print the word "name"
<h1>name</h1>    // Renders: name
```
**In our project**, from `Header.jsx`:
```javascript
<h1>{title}</h1>          // Shows the current page title
<span>{today}</span>      // Shows today's date
```

**Rule 3: JSX must return ONE parent element**
```javascript
// ❌ WRONG — Two sibling elements at the top level
return (
  <h1>Hello</h1>
  <p>World</p>
);

// ✅ CORRECT — Wrapped in a single parent div
return (
  <div>
    <h1>Hello</h1>
    <p>World</p>
  </div>
);

// ✅ ALSO CORRECT — Use a "Fragment" (<> </>) to avoid adding extra divs
return (
  <>
    <h1>Hello</h1>
    <p>World</p>
  </>
);
```
**In our project**, `Sidebar.jsx` uses a Fragment:
```javascript
return (
  <>
    <div className="sidebar-overlay" ... />
    <aside className="sidebar">...</aside>
  </>
);
```

**Rule 4: Self-closing tags must end with `/>` **
```javascript
// In HTML, <img> and <input> don't need closing tags
// In JSX, ALL tags must be closed

<img src="photo.jpg" />     // Self-closing with />
<input type="text" />       // Self-closing with />
<br />                      // Self-closing with />
```

---

## Chapter 5: What are Components?

A **Component** is a reusable, independent piece of UI. Think of it like a custom HTML tag that you design yourself.

### Types of Components

In modern React (which we use), there is only one type: **Functional Components**. These are plain JavaScript functions that return JSX.

```javascript
// A simple component
function Greeting() {
  return <h1>Hello, World!</h1>;
}
```

> **Note:** Older React code used "Class Components" (`class Greeting extends React.Component`). We do NOT use class components anywhere in our project. If the examiner asks, tell them we use functional components with Hooks.

### Components in Our Project

Every `.jsx` file in our project exports exactly one component:

| File | Component | What it draws |
|------|-----------|---------------|
| `App.jsx` | `App` | The entire app skeleton (sidebar + header + pages) |
| `Sidebar.jsx` | `Sidebar` | The left navigation menu |
| `Header.jsx` | `Header` | The top bar with dark mode toggle |
| `StatCard.jsx` | `StatCard` | A single KPI card (like "Total Revenue: ₹27,258") |
| `AlertPanel.jsx` | `AlertPanel` | A single alert row (like "Low Stock!") |
| `QRModal.jsx` | `QRModal` | The popup that shows a QR code |
| `Dashboard.jsx` | `Dashboard` | The full dashboard page |
| `Products.jsx` | `Products` | The full products page |
| `Sales.jsx` | `Sales` | The full sales page |
| And so on... | | |

### How Components Are Used

You use a component just like an HTML tag, but with a **capital letter**:

```javascript
// Using our StatCard component (from Dashboard.jsx)
<StatCard label="Total Products" value={13} color="maroon" />
```

Compare this to a normal HTML tag:
```html
<img src="photo.jpg" alt="A photo" />
```

The pattern is the same! The component name acts as the tag, and the inputs act as attributes.

---

## Chapter 6: What are Props?

**Props** (short for **Properties**) are how you pass data from a **parent** component to a **child** component.

### The Analogy

Think of a component as a function, and props as the arguments you pass to that function:

```javascript
// A regular JavaScript function with arguments
function greet(name, age) {
  return `Hello ${name}, you are ${age} years old`;
}
greet("Danish", 21);  // "Hello Danish, you are 21 years old"

// A React component with props — same concept!
function StatCard({ label, value }) {
  return (
    <div>
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}
// Using it:
<StatCard label="Total Products" value={13} />
```

### Real example from our project

**Parent** (`Dashboard.jsx`) passes data down to **Child** (`StatCard.jsx`):

```javascript
// In Dashboard.jsx (the parent):
<StatCard
  icon={Package}                           // prop 1: an icon component
  label="Total Products"                   // prop 2: a string
  value={data.total_products}              // prop 3: a number from the backend
  color="maroon"                           // prop 4: a string for styling
/>
```

```javascript
// In StatCard.jsx (the child), we RECEIVE these props:
function StatCard({ icon: Icon, label, value, color }) {
  // Now we can use Icon, label, value, and color inside our JSX
  return (
    <div className="stat-card">
      <Icon size={18} />         {/* Uses the icon prop */}
      <h3>{value}</h3>           {/* Uses the value prop */}
      <p>{label}</p>             {/* Uses the label prop */}
    </div>
  );
}
```

### Props are READ-ONLY

A child component can never change its own props. If `Dashboard` passes `value={13}` to `StatCard`, `StatCard` cannot change that 13 to 14. Only the parent can change what it passes down. This is called **one-way data flow** (data flows from parent → child, never the other way).

### Destructuring Props

You'll notice we write `function StatCard({ label, value })` instead of `function StatCard(props)`. This is called **destructuring** — it's a JavaScript shorthand to pull specific values out of an object:

```javascript
// Without destructuring (verbose):
function StatCard(props) {
  return <h3>{props.label}</h3>;
}

// With destructuring (cleaner, what we use):
function StatCard({ label }) {
  return <h3>{label}</h3>;
}

// Both are identical!
```

### The `icon: Icon` rename trick

In `StatCard.jsx`, you'll see `{ icon: Icon }`. This means:
- The prop is called `icon` (lowercase)
- But inside this component, we rename it to `Icon` (uppercase)
- Why? Because React requires component names to start with a capital letter. `<icon />` would be treated as an HTML tag, but `<Icon />` is treated as a React component.

---

## End of Part 1

You now understand:
- ✅ What React is and why it exists
- ✅ What the Virtual DOM is
- ✅ How a React project is created and structured
- ✅ What JSX is and its rules
- ✅ What Components are and how they work
- ✅ What Props are and how data flows from parent to child

**Next:** [Part 2 — State, Hooks, Events & Forms →](./REACT_GUIDE_PART2.md)
