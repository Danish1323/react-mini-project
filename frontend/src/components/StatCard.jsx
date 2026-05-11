// StatCard — KPI metric with colored icon box
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    maroon: { bg: "#f5ede8", color: "#452829" },
    green:  { bg: "#edf7f2", color: "#3d7a5a" },
    orange: { bg: "#fef6ea", color: "#a0620a" },
    red:    { bg: "#fdf0f0", color: "#b83232" },
    blue:   { bg: "#edf3fc", color: "#2b5fa0" },
    slate:  { bg: "#f2f2f3", color: "#57595B" },
  };

  const style = colorMap[color] || colorMap.maroon;

  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrap"
        style={{ background: style.bg }}
      >
        <Icon size={18} color={style.color} />
      </div>
      <div className="stat-body">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
