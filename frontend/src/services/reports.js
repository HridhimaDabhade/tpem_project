import * as excelGen from './excelGenerator';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ------------------------------ */
/* 1️⃣ DOWNLOAD ALL CANDIDATES */
/* ------------------------------ */

export async function downloadAllCandidates() {
  const r = await fetch(`${BASE}/api/candidates?skip=0&limit=200`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('tpeml_token')}` },
  });

  if (!r.ok) throw new Error('Download failed');

  const data = await r.json();
  const csv = excelGen.generateAllCandidatesExcel(data.candidates);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `all-candidates-${new Date().toISOString().split('T')[0]}.csv`);
}

/* ------------------------------ */
/* 2️⃣ DOWNLOAD BRANCH SUMMARY */
/* ------------------------------ */

export async function downloadBranchSummary() {
  const r = await fetch(`${BASE}/api/candidates?skip=0&limit=200`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('tpeml_token')}` },
  });

  if (!r.ok) throw new Error('Download failed');

  const data = await r.json();
  const csv = excelGen.generateBranchSummaryExcel(data.candidates);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `branch-summary-${new Date().toISOString().split('T')[0]}.csv`);
}
