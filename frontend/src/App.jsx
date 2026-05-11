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

const PAGE_TITLES = {
  "/":             "Dashboard",
  "/products":     "Products",
  "/suppliers":    "Suppliers",
  "/sales":        "Sales",
  "/transactions": "Transactions",
  "/reports":      "Reports",
};

function AppLayout({ dark, onToggleDark }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "InvenTrack";

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

function App() {
  // Persist dark mode preference in localStorage
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
