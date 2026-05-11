import { useState, useEffect } from "react";
import { getCategoryStockReport, getLowStockReport, getProfitSummary } from "../api/api";
import { BarChart2, AlertTriangle, TrendingUp, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

// Export array of objects as CSV file
function exportCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Reports() {
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [profitData, setProfitData]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([getCategoryStockReport(), getLowStockReport(), getProfitSummary()])
      .then(([catRes, lowRes, profRes]) => {
        setCategoryData(catRes.data);
        setLowStockData(lowRes.data);
        setProfitData(profRes.data);
      })
      .catch(() => alert("Failed to load reports."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><BarChart2 size={16} /> Loading reports...</div>;

  const tooltipStyle = {
    border: "1px solid #E8D1C5",
    borderRadius: 6,
    fontSize: 12,
    boxShadow: "none",
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Reports</h1>
          <p>Inventory analytics and summaries</p>
        </div>
      </div>

      {/* Category Stock Report */}
      <div className="card">
        <div className="card-header">
          <h2><BarChart2 size={14} /> Category Stock</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportCSV(categoryData, "category_stock.csv")}
          >
            <Download size={12} /> Export
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 0 }}>
          <div style={{ padding: "14px 16px", borderRight: "1px solid var(--border)" }}>
            {categoryData.length === 0 ? (
              <div className="empty-state"><BarChart2 size={32} /><p>No data</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D1C5" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#57595B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#57595B" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f5ede8" }} />
                  <Bar dataKey="total_qty" fill="#452829" radius={[4,4,0,0]} name="Units" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((row) => (
                  <tr key={row.category}>
                    <td><span className="badge badge-muted">{row.category}</span></td>
                    <td>{row.product_count}</td>
                    <td><strong>{row.total_qty}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="card">
        <div className="card-header">
          <h2><AlertTriangle size={14} /> Low Stock</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="card-count" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
              {lowStockData.length}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => exportCSV(lowStockData, "low_stock.csv")}
            >
              <Download size={12} /> Export
            </button>
          </div>
        </div>
        <div className="table-wrap">
          {lowStockData.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <AlertTriangle size={32} />
              <p>All products are well-stocked</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Qty</th>
                  <th>Reorder Level</th>
                  <th>Deficit</th>
                </tr>
              </thead>
              <tbody>
                {lowStockData.map((item) => (
                  <tr key={item.id} className="low-stock-row">
                    <td><strong>{item.name}</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--text-muted)" }}>{item.sku}</td>
                    <td><span className="badge badge-muted">{item.category}</span></td>
                    <td style={{ fontWeight: 700, color: "var(--danger)" }}>{item.quantity}</td>
                    <td>{item.reorder_level}</td>
                    <td>
                      <span className="badge badge-danger">
                        -{item.reorder_level - item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Profit Summary */}
      <div className="card">
        <div className="card-header">
          <h2><TrendingUp size={14} /> Monthly Profit Summary</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportCSV(profitData, "profit_summary.csv")}
          >
            <Download size={12} /> Export
          </button>
        </div>
        <div className="card-body">
          {profitData.length === 0 ? (
            <div className="empty-state"><TrendingUp size={32} /><p>No sales data yet</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={profitData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D1C5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#57595B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#57595B" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val) => `₹${val}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#452829" strokeWidth={2} name="Revenue" dot={{ r: 3, fill: "#452829" }} />
                  <Line type="monotone" dataKey="profit" stroke="#3d7a5a" strokeWidth={2} name="Profit" dot={{ r: 3, fill: "#3d7a5a" }} />
                </LineChart>
              </ResponsiveContainer>

              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Transactions</th>
                      <th>Revenue</th>
                      <th>Profit</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.map((row) => (
                      <tr key={row.month}>
                        <td style={{ fontWeight: 600 }}>{row.month}</td>
                        <td>{row.transactions}</td>
                        <td style={{ color: "var(--info)", fontWeight: 600 }}>₹{row.revenue.toFixed(2)}</td>
                        <td style={{ color: "var(--success)", fontWeight: 600 }}>₹{row.profit.toFixed(2)}</td>
                        <td>
                          <span className="badge badge-success">
                            {row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
