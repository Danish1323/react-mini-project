import { AlertTriangle, AlertCircle } from "lucide-react";

// AlertPanel — expiry / restock alert row
function AlertPanel({ type, title, detail }) {
  const Icon = type === "danger" ? AlertCircle : AlertTriangle;
  const color = type === "danger" ? "var(--danger)" : "var(--warning)";

  return (
    <div className={`alert-item ${type}`}>
      <Icon size={14} color={color} />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default AlertPanel;
