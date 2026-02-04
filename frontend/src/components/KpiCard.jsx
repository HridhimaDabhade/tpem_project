const ICONS = {
  'Yet to Interview': '⏳',
  'Interview Completed': '✓',
  'Total Candidates': '👥',
  'Shortlisted': '⭐',
  'Rejected': '✗',
  'On Hold': '⏸',
};

export function KpiCard({ title, value, sub, color, active }) {
  const icon = ICONS[title] || '📊';
  const cardColor = color || 'var(--tata-blue)';

  const cardStyle = {
    borderLeft: `4px solid ${cardColor}`,
    ...(active && {
      background: 'var(--tata-blue-light)',
      borderColor: 'var(--tata-blue)',
      boxShadow: '0 4px 16px rgba(0, 102, 179, 0.2)',
      transform: 'translateY(-2px)',
    })
  };

  return (
    <div className="kpi-card" style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="kpi-card__title">{title}</div>
        <div style={{ fontSize: 24, opacity: active ? 0.6 : 0.3, transition: 'opacity 0.2s' }}>{icon}</div>
      </div>
      <div className="kpi-card__value" style={{ color: cardColor }}>{value}</div>
      {sub != null && <div className="kpi-card__sub">{sub}</div>}
      {active && (
        <div style={{ 
          marginTop: 8, 
          fontSize: 11, 
          fontWeight: 600, 
          color: 'var(--tata-blue)', 
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          ✓ Active Filter
        </div>
      )}
    </div>
  );
}
