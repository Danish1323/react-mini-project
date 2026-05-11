import { useState, useEffect } from "react";
import { getTransactions } from "../api/api";
import { ClipboardList, ShoppingCart, Package, RefreshCw, Trash2 } from "lucide-react";

const ACTION_META = {
  SALE_RECORDED:   { label: "Sale",           icon: ShoppingCart, badge: "badge-success" },
  PRODUCT_ADDED:   { label: "Product Added",  icon: Package,      badge: "badge-info"    },
  PRODUCT_DELETED: { label: "Product Deleted",icon: Trash2,       badge: "badge-danger"  },
  STOCK_UPDATED:   { label: "Stock Updated",  icon: RefreshCw,    badge: "badge-primary" },
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("All");

  useEffect(() => {
    getTransactions()
      .then((res) => setTransactions(res.data))
      .catch(() => alert("Could not load transactions."))
      .finally(() => setLoading(false));
  }, []);

  const actionTypes = ["All", ...new Set(transactions.map((t) => t.action))];
  const filtered = filter === "All" ? transactions : transactions.filter((t) => t.action === filter);

  if (loading) return <div className="loading"><ClipboardList size={16} /> Loading logs...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Transaction Logs</h1>
          <p>Full audit trail of all inventory events</p>
        </div>
        <div className="page-header-actions">
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {actionTypes.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2><ClipboardList size={14} /> Activity Log</h2>
          <span className="card-count">{filtered.length}</span>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={36} />
              <p>No transactions found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Action</th>
                  <th>Product</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const meta = ACTION_META[t.action] || { label: t.action, icon: ClipboardList, badge: "badge-muted" };
                  const Icon = meta.icon;
                  return (
                    <tr key={t.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: 11 }}>#{t.id}</td>
                      <td>
                        <span className={`badge ${meta.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Icon size={9} />
                          {meta.label}
                        </span>
                      </td>
                      <td><strong>{t.product_name || "—"}</strong></td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320 }}>{t.details}</td>
                      <td style={{ fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(t.timestamp).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
