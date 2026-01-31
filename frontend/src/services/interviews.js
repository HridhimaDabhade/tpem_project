import { api } from './api';

export async function listYetToInterview({ role, eligibility } = {}) {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (eligibility) params.set('eligibility', eligibility);
  return api('GET', `/api/interviews/yet-to-interview?${params}`);
}

export async function submitInterview(candidateId, { notes, decision }) {
  return api('POST', '/api/interviews/submit', {
    candidate_id: candidateId,
    notes,
    decision,
  });
}

export async function listCompleted({ fromDate, toDate, role, decision } = {}) {
  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  if (role) params.set('role', role);
  if (decision) params.set('decision', decision);
  return api('GET', `/api/interviews/completed?${params}`);
}

export async function getCompleted(interviewId) {
  return api('GET', `/api/interviews/completed/${interviewId}`);
}
