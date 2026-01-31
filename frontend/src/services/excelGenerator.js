/**
 * Simple Excel generator for mock data downloads
 * Generates CSV which Excel can open
 */

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCsv(headers, rows) {
  const csvHeaders = headers.map(escapeCsv).join(',');
  const csvRows = rows.map(row =>
    headers.map(header => escapeCsv(row[header])).join(',')
  ).join('\n');
  return `${csvHeaders}\n${csvRows}`;
}

export function generateAuditLogsExcel(logs) {
  const headers = ['Timestamp', 'User', 'Action', 'Details'];
  const rows = logs.map(log => ({
    'Timestamp': new Date(log.timestamp).toLocaleString(),
    'User': log.user,
    'Action': log.action,
    'Details': log.details,
  }));
  return arrayToCsv(headers, rows);
}

export function generateInterviewResultsExcel(interviews) {
  const headers = ['Candidate ID', 'Name', 'Email', 'Role', 'Interview Date', 'Decision', 'Notes'];
  const rows = interviews.map(interview => ({
    'Candidate ID': interview.candidate_id || interview.id,
    'Name': interview.name,
    'Email': interview.email,
    'Role': interview.role,
    'Interview Date': interview.interview_date ? new Date(interview.interview_date).toLocaleDateString() : '–',
    'Decision': interview.interview_status || interview.decision || '–',
    'Notes': interview.interview_notes || interview.notes || '–',
  }));
  return arrayToCsv(headers, rows);
}

export function generateDailyLogExcel(candidates) {
  const headers = ['Candidate ID', 'Name', 'Email', 'Role', 'Applied Date', 'Status', 'Eligibility', 'Phone'];
  const rows = candidates.map(candidate => ({
    'Candidate ID': candidate.candidate_id || candidate.id,
    'Name': candidate.name,
    'Email': candidate.email,
    'Role': candidate.role,
    'Applied Date': candidate.applied_date ? new Date(candidate.applied_date).toLocaleDateString() : '–',
    'Status': candidate.status,
    'Eligibility': candidate.eligibility,
    'Phone': candidate.phone,
  }));
  return arrayToCsv(headers, rows);
}

export function generateCandidatesExcel(candidates) {
  const headers = ['Candidate ID', 'Name', 'Email', 'Phone', 'Role', 'Experience', 'Location', 'Education', 'Status', 'Eligibility'];
  const rows = candidates.map(candidate => ({
    'Candidate ID': candidate.candidate_id || candidate.id,
    'Name': candidate.name,
    'Email': candidate.email,
    'Phone': candidate.phone,
    'Role': candidate.role,
    'Experience': candidate.experience_years ? `${candidate.experience_years} years` : '–',
    'Location': candidate.location,
    'Education': candidate.education,
    'Status': candidate.status,
    'Eligibility': candidate.eligibility,
  }));
  return arrayToCsv(headers, rows);
}

export function createBlobFromCsv(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return blob;
}
