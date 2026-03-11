export default function StatCard({ icon, label, value, description, color = 'blue', delay = 0 }) {
  return (
    <div className={`card stat-card ${color} animate-in animate-in-delay-${delay}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-desc">{description}</div>
    </div>
  );
}
