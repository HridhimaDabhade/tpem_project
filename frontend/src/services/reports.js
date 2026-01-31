import * as excelGen from './excelGenerator';
import * as mockData from './mockData';

const USE_MOCK_API = true; // Set to false when backend is ready

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function downloadDailyLog(fromDate, toDate) {
  if (USE_MOCK_API) {
    // Generate CSV from mock data
    const csv = excelGen.generateDailyLogExcel(mockData.mockCandidates);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `daily-log-${new Date().toISOString().split('T')[0]}.csv`);
    return;
  }

  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  const r = await fetch(`/api/reports/daily-log?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('tpeml_token')}` },
  });
  if (!r.ok) throw new Error('Download failed');
  const blob = await r.blob();
  const name = r.headers.get('Content-Disposition')?.match(/filename="?([^";]+)/)?.[1] || 'daily-log.xlsx';
  downloadBlob(blob, name);
}

export async function downloadInterviewResults(fromDate, toDate, role, decision) {
  if (USE_MOCK_API) {
    // Generate CSV from mock data
    let filtered = mockData.mockInterviewsCompleted;
    if (role) {
      filtered = filtered.filter(c => c.role.toLowerCase().includes(role.toLowerCase()));
    }
    if (decision) {
      filtered = filtered.filter(c => c.interview_status === decision || c.decision === decision);
    }
    const csv = excelGen.generateInterviewResultsExcel(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `interview-results-${new Date().toISOString().split('T')[0]}.csv`);
    return;
  }

  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  if (role) params.set('role', role);
  if (decision) params.set('decision', decision);
  const r = await fetch(`/api/reports/interview-results?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('tpeml_token')}` },
  });
  if (!r.ok) throw new Error('Download failed');
  const blob = await r.blob();
  const name = r.headers.get('Content-Disposition')?.match(/filename="?([^";]+)/)?.[1] || 'interview-results.xlsx';
  downloadBlob(blob, name);
}

export async function downloadAuditLogs(fromDate, toDate) {
  if (USE_MOCK_API) {
    // Generate CSV from mock data
    let filtered = mockData.mockAuditLogs;
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate).getTime() : 0;
      const to = toDate ? new Date(toDate).getTime() : Date.now();
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= from && logTime <= to;
      });
    }
    const csv = excelGen.generateAuditLogsExcel(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    return;
  }

  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  const r = await fetch(`/api/reports/audit-logs?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('tpeml_token')}` },
  });
  if (!r.ok) throw new Error('Download failed');
  const blob = await r.blob();
  const name = r.headers.get('Content-Disposition')?.match(/filename="?([^";]+)/)?.[1] || 'audit-logs.xlsx';
  downloadBlob(blob, name);
}
