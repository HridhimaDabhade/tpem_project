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

/**
 * Self-onboarding for candidates (public endpoint, no auth required)
 */
export async function selfOnboard(payload) {
  // Make API call without auth token
  const BASE = import.meta.env.VITE_API_BASE_URL || '';
  const response = await fetch(`${BASE}/api/public/onboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to submit application' }));
    throw new Error(error.detail || error.message || 'Failed to submit application');
  }

  return response.json();
}
