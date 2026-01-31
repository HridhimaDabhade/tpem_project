export function StatusTag({ type, value }) {
  const k = (value || type || '').toLowerCase().replace(/\s+/g, '-');
  const cls = [
    'tag',
    k.includes('yet') && 'tag--yet-to-interview',
    k.includes('completed') && 'tag--interview-completed',
    k === 'criteria_met' && 'tag--criteria-met',
    k === 'not_met' && 'tag--not-met',
    k === 'partial' && 'tag--partial',
    k === 'shortlist' && 'tag--shortlist',
    k === 'reject' && 'tag--reject',
    k === 'hold' && 'tag--hold',
    k === 'pending' && 'tag--pending',
  ].filter(Boolean).join(' ');
  return <span className={cls}>{value || type}</span>;
}
