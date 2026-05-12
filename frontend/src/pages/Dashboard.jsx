import { useState, useEffect } from "react";
import { getDashboard, getInsights, restockProduct } from "../api/api";
import StatCard from "../components/StatCard";
import AlertPanel from "../components/AlertPanel";
import {
  Package, AlertTriangle, IndianRupee, TrendingUp,
  BarChart2, Trophy, Activity, Bell, Sparkles,
  AlertCircle, Info
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const PIE_COLORS = ["#452829", "#7a4545", "#a06060", "#57595B", "#888b8d", "#c4a89a"];

const ACTION_ICONS = {
  SALE_RECORDED:   { icon: IndianRupee, bg: "#edf7f2", color: "#3d7a5a" },
  PRODUCT_ADDED:   { icon: Package,     bg: "#edf3fc", color: "#2b5fa0" },
  PRODUCT_DELETED: { icon: Package,     bg: "#fdf0f0", color: "#b83232" },
  STOCK_UPDATED:   { icon: Activity,    bg: "#f5ede8", color: "#452829" },
};

function Dashboard() {
  const [data, setData]       = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  useEffect(() => {
    Promise.all([getDashboard(), getInsights()])
      .then(([dRes, iRes]) => {
        setData(dRes.data);
        setInsights(iRes.data);
      })
      .catch(() => alert("Could not reach backend. Is it running?"))
      .finally(() => setLoading(false));
  }, []);

  const openRestockModal = (id, name) => {
    setRestockItem({ id, name });
    setRestockQty("");
  };

  const submitRestock = async () => {
    if (!restockItem) return;
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    
    try {
      await restockProduct(restockItem.id, qty);
      // Refresh dashboard data
      const [dRes, iRes] = await Promise.all([getDashboard(), getInsights()]);
      setData(dRes.data);
      setInsights(iRes.data);
      setRestockItem(null);
    } catch (err) {
      alert("Failed to restock product.");
    }
  };

  if (loading) return <div className="loading"><Activity size={16} /> Loading dashboard...</div>;
  if (!data) return <div className="loading">No data available.</div>;

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard icon={Package}       label="Total Products"  value={data.total_products}                      color="maroon" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={data.low_stock_count}                     color="red"    />
        <StatCard icon={IndianRupee}   label="Total Revenue"   value={`₹${data.total_sales.toLocaleString()}`}  color="green"  />
        <StatCard icon={TrendingUp}    label="Total Profit"    value={`₹${data.total_profit.toLocaleString()}`} color="orange" />
      </div>

      {/* AI Smart Insights */}
      {insights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>
              <Sparkles size={14} />
              Smart Insights
            </h2>
            <span className="card-count" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
              {insights.length} alert{insights.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="card-body">
            {insights.map((item) => {
              const iconColor = item.level === "critical" ? "var(--danger)" : item.level === "warning" ? "var(--warning)" : "var(--info)";
              const iconBg    = item.level === "critical" ? "var(--danger-bg)" : item.level === "warning" ? "var(--warning-bg)" : "var(--info-bg)";
              const Icon      = item.level === "critical" ? AlertCircle : item.level === "warning" ? AlertTriangle : Info;
              return (
                <div key={item.id} className={`insight-item ${item.level}`}>
                  <div className="insight-icon" style={{ background: iconBg }}>
                    <Icon size={14} color={iconColor} />
                  </div>
                  <div className="insight-body" style={{ flex: 1 }}>
                    <div className="i-name">{item.name}</div>
                    <div className="i-msg">{item.message}</div>
                    <div className="i-meta">
                      Stock: {item.quantity} units &nbsp;·&nbsp; Avg sales: {item.avg_daily_sales} units/day
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => openRestockModal(item.id, item.name)}>
                    Restock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      {(data.expiring_soon.length > 0 || data.restock_due.length > 0) && (
        <div className="card">
          <div className="card-header">
            <h2><Bell size={14} /> Alerts</h2>
            <span className="card-count">
              {data.expiring_soon.length + data.restock_due.length}
            </span>
          </div>
          <div className="card-body">
            {data.expiring_soon.map((item) => (
              <AlertPanel
                key={`exp-${item.id}`}
                type="danger"
                title={`${item.name} — Expiring Soon`}
                detail={`Expiry: ${item.expiry_date}`}
              />
            ))}
            {data.restock_due.map((item) => (
              <AlertPanel
                key={`rst-${item.id}`}
                type="warning"
                title={`${item.name} — Restock Due`}
                detail={`Restock by: ${item.restock_date}`}
                onRestock={() => openRestockModal(item.id, item.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2><BarChart2 size={14} /> Category Stock</h2>
          </div>
          <div className="card-body" style={{ padding: "12px 16px" }}>
            {data.category_summary.length === 0 ? (
              <div className="empty-state">
                <BarChart2 size={32} />
                <p>No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={data.category_summary} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8d1c5" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#57595B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#57595B" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #E8D1C5", borderRadius: 6, fontSize: 12 }}
                    cursor={{ fill: "#f5ede8" }}
                  />
                  <Bar dataKey="total_qty" fill="#452829" radius={[4, 4, 0, 0]} name="Qty" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2><Trophy size={14} /> Top Selling</h2>
          </div>
          <div className="card-body" style={{ padding: "12px 16px" }}>
            {data.top_selling.length === 0 ? (
              <div className="empty-state">
                <Trophy size={32} />
                <p>No sales recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={data.top_selling}
                    dataKey="total_sold"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    innerRadius={38}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {data.top_selling.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} units`, "Sold"]}
                    contentStyle={{ border: "1px solid #E8D1C5", borderRadius: 6, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2><Activity size={14} /> Recent Activity</h2>
        </div>
        <div className="card-body">
          {data.recent_transactions.length === 0 ? (
            <div className="empty-state">
              <Activity size={32} />
              <p>No activity yet</p>
            </div>
          ) : (
            data.recent_transactions.map((t, i) => {
              const meta = ACTION_ICONS[t.action] || ACTION_ICONS.STOCK_UPDATED;
              const Icon = meta.icon;
              return (
                <div key={i} className="activity-item">
                  <div className="activity-icon" style={{ background: meta.bg }}>
                    <Icon size={13} color={meta.color} />
                  </div>
                  <div className="activity-body">
                    <div className="title">{t.product_name}</div>
                    <div className="detail">{t.details}</div>
                    <div className="time">
                      {new Date(t.timestamp).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <div className="modal-overlay" onClick={() => setRestockItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Restock Product</div>
                <div className="modal-subtitle">Add units for {restockItem.name}</div>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label>Quantity to Add</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="e.g. 50"
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setRestockItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRestock}>Confirm Restock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
