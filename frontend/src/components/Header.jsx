import { Menu, Sun, Moon } from "lucide-react";

function Header({ title, onHamburgerClick, dark, onToggleDark }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="hamburger"
          onClick={onHamburgerClick}
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <h1>{title}</h1>
      </div>

      <div className="topbar-right">
        <span className="topbar-date">{today}</span>

        {/* Dark / Light toggle */}
        <button
          className="theme-toggle"
          onClick={onToggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
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
