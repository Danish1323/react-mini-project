import { useEffect, useState } from "react";

// Custom hook — counts up from 0 to target numerically
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Extract the numeric portion (handles "₹27,258" or plain numbers)
    const raw = String(target).replace(/[₹,\s]/g, "");
    const numeric = parseFloat(raw);

    if (isNaN(numeric) || numeric === 0) {
      setDisplay(target); // not numeric, just show as-is
      return;
    }

    let start = 0;
    const steps = 40;
    const increment = numeric / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numeric) {
        setDisplay(target); // show original formatted string at the end
        clearInterval(timer);
      } else {
        // Reconstruct with same prefix/suffix as original
        const prefix = String(target).startsWith("₹") ? "₹" : "";
        setDisplay(prefix + Math.floor(start).toLocaleString("en-IN"));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return display;
}

// Color presets
const COLOR_MAP = {
  maroon: { bg: "#f5ede8", color: "#452829" },
  green:  { bg: "#edf7f2", color: "#3d7a5a" },
  orange: { bg: "#fef6ea", color: "#a0620a" },
  red:    { bg: "#fdf0f0", color: "#b83232" },
  blue:   { bg: "#edf3fc", color: "#2b5fa0" },
  slate:  { bg: "#f2f2f3", color: "#57595B" },
};

function StatCard({ icon: Icon, label, value, color }) {
  const style = COLOR_MAP[color] || COLOR_MAP.maroon;
  const animated = useCountUp(value);

  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: style.bg }}>
        <Icon size={18} color={style.color} />
      </div>
      <div className="stat-body">
        <h3 className="stat-value">{animated}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
