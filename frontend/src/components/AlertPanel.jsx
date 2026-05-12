import { AlertTriangle, AlertCircle } from "lucide-react";

// AlertPanel — expiry / restock alert row
function AlertPanel({ type, title, detail, onRestock }) {
  const Icon = type === "danger" ? AlertCircle : AlertTriangle;
  const color = type === "danger" ? "var(--danger)" : "var(--warning)";

  return (
    <div className={`alert-item ${type}`}>
      <Icon size={14} color={color} />
      <div style={{ flex: 1 }}>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      {onRestock && (
        <button className="btn btn-sm btn-outline" onClick={onRestock}>
          Restock
        </button>
      )}
    </div>
  );
}

export default AlertPanel;
