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
  const headers = ['Candidate ID', 'Name', 'Email', 'Contact', 'Diploma Branch', 'Interview Date', 'Decision', 'Notes'];
  const rows = interviews.map(interview => ({
    'Candidate ID': interview.candidate_id || interview.id,
    'Name': interview.name,
    'Email': interview.email,
    'Contact': interview.contact_no,
    'Diploma Branch': interview.diploma_branch,
    'Interview Date': interview.interview_date ? new Date(interview.interview_date).toLocaleDateString() : '–',
    'Decision': interview.interview_status || interview.decision || '–',
    'Notes': interview.interview_notes || interview.notes || '–',
  }));
  return arrayToCsv(headers, rows);
}

export function generateDailyLogExcel(candidates) {
  const headers = ['Candidate ID', 'Name', 'Email', 'Contact', 'Diploma Branch', 'Registered Date', 'Status'];
  const rows = candidates.map(candidate => ({
    'Candidate ID': candidate.candidate_id || candidate.id,
    'Name': candidate.name,
    'Email': candidate.email,
    'Contact': candidate.contact_no,
    'Diploma Branch': candidate.diploma_branch,
    'Registered Date': candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : '–',
    'Status': candidate.status,
  }));
  return arrayToCsv(headers, rows);
}

export function generateCandidatesExcel(candidates) {
  const headers = [
    'Candidate ID', 'Name', 'Gender', 'DOB', 'Email', 'Contact', 'State',
    'Interview Location', 'Interview Date', 'Recruitment Year',
    'College', 'Diploma Branch', 'Diploma %', 'Diploma Passout Year',
    '10th %', '12th %', 'Status', 'Onboarding Type'
  ];
  const rows = candidates.map(candidate => ({
    'Candidate ID': candidate.candidate_id || candidate.id,
    'Name': candidate.name,
    'Gender': candidate.gender || '–',
    'DOB': candidate.dob ? new Date(candidate.dob).toLocaleDateString() : '–',
    'Email': candidate.email || '–',
    'Contact': candidate.contact_no || '–',
    'State': candidate.state_of_domicile || '–',
    'Interview Location': candidate.interview_location || '–',
    'Interview Date': candidate.date_of_interview ? new Date(candidate.date_of_interview).toLocaleDateString() : '–',
    'Recruitment Year': candidate.year_of_recruitment || '–',
    'College': candidate.college_name || '–',
    'Diploma Branch': candidate.diploma_branch || '–',
    'Diploma %': candidate.diploma_percentage || '–',
    'Diploma Passout Year': candidate.diploma_passout_year || '–',
    '10th %': candidate.tenth_percentage || '–',
    '12th %': candidate.twelfth_percentage || '–',
    'Status': candidate.status,
    'Onboarding Type': candidate.onboarding_type || '–',
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
