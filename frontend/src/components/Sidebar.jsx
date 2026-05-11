import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Building2,
  ShoppingCart,
  ClipboardList,
  BarChart2,
  Boxes,
} from "lucide-react";

const navItems = [
  { to: "/",             icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/products",     icon: Package,          label: "Products"     },
  { to: "/suppliers",    icon: Building2,        label: "Suppliers"    },
  { to: "/sales",        icon: ShoppingCart,     label: "Sales"        },
  { to: "/transactions", icon: ClipboardList,    label: "Transactions" },
  { to: "/reports",      icon: BarChart2,        label: "Reports"      },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-logo">
          <h2>
            <Boxes size={17} className="logo-icon" />
            InvenTrack
          </h2>
          <p>Inventory Management</p>
        </div>

        {/* Nav */}
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

        <div className="sidebar-footer">React · FastAPI · Mini Project</div>
      </aside>
    </>
  );
}

export default Sidebar;
