# Kushal's React Contribution Breakdown (25%)

Welcome! This document outlines the 25% of the frontend React code written by **Kushal** for the InvenTrack project. 

If you have never seen React before, don't worry! We will explain everything from the very basics.

## What is React?
React is a JavaScript library used to build user interfaces (websites). Instead of writing one massive HTML file, React lets you break your website down into smaller, reusable building blocks called **Components**. 

Think of a **Component** like a custom LEGO piece. Once you build a "Button" LEGO piece, you can use it anywhere in your app!

---

## 1. The `StatCard` Component
**File:** `frontend/src/components/StatCard.jsx`

This component is used on the Dashboard to show small boxes with numbers (like "Total Revenue").

### The Code
```javascript
1:  import React from "react";
2:  
3:  function StatCard({ icon: Icon, label, value, color }) {
4:    return (
5:      <div className={`stat-card border-${color}`}>
6:        <div className="stat-icon" style={{ color: `var(--${color})`, background: `var(--${color}-bg)` }}>
7:          <Icon size={20} />
8:        </div>
9:        <div className="stat-info">
10:         <h3>{label}</h3>
11:         <div className="value">{value}</div>
12:       </div>
13:     </div>
14:   );
15: }
16: 
17: export default StatCard;
```

### Line-by-Line Explanation
- **Line 1:** `import React from "react";` tells the file that we are using React.
- **Line 3:** `function StatCard({ icon: Icon, label, value, color })` is where we define our custom component. In React, components are just JavaScript functions that return HTML. The things inside the `{ }` are called **props** (short for properties). Props are just inputs. We are passing in an `icon`, a text `label`, a number `value`, and a `color`.
- **Line 4:** `return (` starts the block of HTML that this component will draw on the screen. In React, writing HTML inside JavaScript is called **JSX**.
- **Line 5:** `<div className={\`stat-card border-${color}\`}>` creates a box. Notice we use `className` instead of `class` like in normal HTML. The `${color}` part dynamically injects the color we passed in.
- **Line 6-8:** This creates a smaller box for the icon. `<Icon size={20} />` takes the icon we passed in and renders it at size 20.
- **Line 9-12:** This creates the text area. `<h3>{label}</h3>` takes the `label` we passed in and makes it a heading. `{value}` prints the number.
- **Line 17:** `export default StatCard;` makes this component available so other files in our project can import it and use it.

---

## 2. The `AlertPanel` Component
**File:** `frontend/src/components/AlertPanel.jsx`

This component is used to show warning messages (like "Low Stock!").

### The Code
```javascript
1:  import { AlertTriangle, AlertCircle } from "lucide-react";
2:  
3:  function AlertPanel({ type, title, detail, onRestock }) {
4:    const Icon = type === "danger" ? AlertCircle : AlertTriangle;
5:    const color = type === "danger" ? "var(--danger)" : "var(--warning)";
6:  
7:    return (
8:      <div className={`alert-item ${type}`}>
9:        <Icon size={14} color={color} />
10:       <div style={{ flex: 1 }}>
11:         <strong>{title}</strong>
12:         <span>{detail}</span>
13:       </div>
14:       {onRestock && (
15:         <button className="btn btn-sm btn-outline" onClick={onRestock}>
16:           Restock
17:         </button>
18:       )}
19:     </div>
20:   );
21: }
22: 
23: export default AlertPanel;
```

### Line-by-Line Explanation
- **Line 1:** We import two icons (`AlertTriangle`, `AlertCircle`) from a library called `lucide-react`.
- **Line 3:** We define our component. It takes inputs: `type` (danger or warning), `title`, `detail`, and an `onRestock` function.
- **Line 4-5:** Here we use a **Ternary Operator** (a one-line if-statement). `type === "danger" ? AlertCircle : AlertTriangle;` means: If the type is "danger", use the Circle icon. Otherwise, use the Triangle icon. We do the same for the color.
- **Line 8-13:** We draw the HTML. `style={{ flex: 1 }}` is how we write inline CSS in React. Notice the double curly braces!
- **Line 14-18:** `{onRestock && ( ... )}` is **Conditional Rendering**. It means: If the `onRestock` input exists, then draw the button on the screen. If it doesn't exist, draw nothing.
- **Line 15:** `onClick={onRestock}` tells React: When the user clicks this button, run the `onRestock` function.

---

## 3. The `Header` Component
**File:** `frontend/src/components/Header.jsx`

This is the top bar of the website that contains the Dark Mode toggle.

### The Code
```javascript
1:  import { Sun, Moon } from "lucide-react";
2:  
3:  function Header({ theme, toggleTheme }) {
4:    return (
5:      <header className="topbar">
6:        <div className="topbar-right">
7:          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
8:            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
9:          </button>
10:       </div>
11:     </header>
12:   );
13: }
14: 
15: export default Header;
```

### Line-by-Line Explanation
- **Line 3:** The `Header` takes two inputs: `theme` (the current theme string like "dark" or "light") and `toggleTheme` (a function that changes the theme).
- **Line 7:** `<button onClick={toggleTheme}>` means clicking the button will run the function to flip the theme.
- **Line 8:** `{theme === "light" ? <Moon /> : <Sun />}`. This checks the current theme. If it is light, it shows a Moon icon (to indicate you can click it to go dark). If it is dark, it shows a Sun icon.

---

## 4. The `Sidebar` Component
**File:** `frontend/src/components/Sidebar.jsx`

This is the navigation menu on the left side of the screen.

### The Code
```javascript
1:  import { NavLink } from "react-router-dom";
2:  import { LayoutDashboard, Package, Truck, ShoppingCart, FileText, Activity } from "lucide-react";
3:  
4:  function Sidebar() {
5:    return (
6:      <aside className="sidebar">
7:        <div className="brand">
8:          <div className="logo-box">IT</div>
9:          <h1>InvenTrack</h1>
10:       </div>
11:       <nav className="nav-menu">
12:         <NavLink to="/" className="nav-item" end><LayoutDashboard size={18} /> Dashboard</NavLink>
13:         <NavLink to="/products" className="nav-item"><Package size={18} /> Products</NavLink>
14:         <NavLink to="/suppliers" className="nav-item"><Truck size={18} /> Suppliers</NavLink>
15:         <NavLink to="/sales" className="nav-item"><ShoppingCart size={18} /> Sales</NavLink>
16:         <NavLink to="/reports" className="nav-item"><FileText size={18} /> Reports</NavLink>
17:         <NavLink to="/transactions" className="nav-item"><Activity size={18} /> Transactions</NavLink>
18:       </nav>
19:     </aside>
20:   );
21: }
22: 
23: export default Sidebar;
```

### Line-by-Line Explanation
- **Line 1:** We import `NavLink` from `react-router-dom`. In a React app, clicking a link doesn't refresh the page like a normal website. `NavLink` is a special React component that magically changes the URL without reloading the page. It also knows if you are currently on that page, allowing us to highlight the active menu item.
- **Line 11-18:** We use the `<NavLink>` tag. The `to="/"` tells it where to navigate. We also include an icon next to the text.

---

## 5. The `QRModal` Component
**File:** `frontend/src/components/QRModal.jsx`

This component draws a pop-up window containing a QR code.

### The Code
```javascript
1:  import { QRCodeSVG } from "qrcode.react";
2:  import { X, Download } from "lucide-react";
3:  
4:  function QRModal({ product, onClose }) {
5:    if (!product) return null;
6:  
7:    const qrData = JSON.stringify({
8:      name: product.name,
9:      sku: product.sku,
10:     category: product.category,
11:     qty: product.quantity
12:   });
13: 
14:   const handleDownload = () => {
15:     const svg = document.getElementById("qr-svg");
16:     const svgData = new XMLSerializer().serializeToString(svg);
17:     const canvas = document.createElement("canvas");
18:     const ctx = canvas.getContext("2d");
19:     const img = new Image();
20:     img.onload = () => {
21:       canvas.width = img.width;
22:       canvas.height = img.height;
23:       ctx.fillStyle = "white";
24:       ctx.fillRect(0, 0, canvas.width, canvas.height);
25:       ctx.drawImage(img, 0, 0);
26:       const a = document.createElement("a");
27:       a.download = `QR_${product.sku}.png`;
28:       a.href = canvas.toDataURL("image/png");
29:       a.click();
30:     };
31:     img.src = "data:image/svg+xml;base64," + btoa(svgData);
32:   };
33: 
34:   return (
35:     <div className="modal-overlay" onClick={onClose}>
36:       <div className="modal-box" onClick={(e) => e.stopPropagation()}>
37:         <div className="modal-header">
38:           <div className="modal-title">QR Code: {product.name}</div>
39:           <button className="icon-btn" onClick={onClose}><X size={18} /></button>
40:         </div>
41:         <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
42:           <QRCodeSVG id="qr-svg" value={qrData} size={200} fgColor="var(--text)" bgColor="transparent" />
43:         </div>
44:         <div style={{ display: "flex", justifyContent: "flex-end" }}>
45:           <button className="btn btn-outline" onClick={handleDownload}><Download size={14} /> Download PNG</button>
46:         </div>
47:       </div>
48:     </div>
49:   );
50: }
51: 
52: export default QRModal;
```

### Line-by-Line Explanation
- **Line 1:** `import { QRCodeSVG }` brings in a third-party tool that automatically draws QR codes.
- **Line 5:** `if (!product) return null;` is a safety check. If we didn't pass a product into this component, don't draw anything (return null).
- **Line 7-12:** `JSON.stringify` takes the product data (name, sku, category, quantity) and turns it into a plain text string so the QR code can read it.
- **Line 14-32:** This is the `handleDownload` function. It looks scary, but it's just standard browser code to convert an SVG image (which is how the QR code is drawn) into a PNG image and save it to the user's computer. It grabs the SVG, puts it on a digital "canvas", colors the background white, and clicks an invisible download link.
- **Line 35:** `<div className="modal-overlay" onClick={onClose}>` draws the blurry dark background behind the popup. If you click on it, it runs `onClose` to close the popup.
- **Line 36:** `<div className="modal-box" onClick={(e) => e.stopPropagation()}>` draws the actual popup box. `e.stopPropagation()` means "if I click inside the box, do NOT close the popup".
- **Line 42:** `<QRCodeSVG>` takes our `qrData` text string and visually draws the black and white squares of the QR code!
