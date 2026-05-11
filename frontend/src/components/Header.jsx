import { Menu } from "lucide-react";

function Header({ title, onHamburgerClick }) {
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
        <span className="live-dot">
          <span className="live-dot-circle" />
          Live
        </span>
      </div>
    </header>
  );
}

export default Header;
