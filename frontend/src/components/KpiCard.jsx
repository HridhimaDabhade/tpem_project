export function KpiCard({ title, value, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__title">{title}</div>
      <div className="kpi-card__value">{value}</div>
      {sub != null && <div className="kpi-card__sub">{sub}</div>}
    </div>
  );
}
