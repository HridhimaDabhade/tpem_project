import { api } from './api';

export async function search(q) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  return api('GET', `/api/candidates/search?${params}`);
}

export async function getById(candidateId) {
  return api('GET', `/api/candidates/id/${encodeURIComponent(candidateId)}`);
}

export async function list({ status, role, skip = 0, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (role) params.set('role', role);
  params.set('skip', skip);
  params.set('limit', limit);
  return api('GET', `/api/candidates?${params}`);
}

export async function create(payload) {
  return api('POST', '/api/candidates', payload);
}
