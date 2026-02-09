/**
 * API client – base URL, Bearer token, error handling.
 * Uses Vite proxy: /api -> backend.
 * MOCK MODE: Set USE_MOCK_API to true to use hardcoded data
 */
const USE_MOCK_API = false; // Connected to real backend
const BASE = import.meta.env.VITE_API_BASE_URL || '';

import * as mockData from './mockData';

// Mock API router
const mockRouter = {
  'POST /api/auth/login': () => mockData.mockAuthData,
  'GET /api/auth/me': () => mockData.mockAuthData.user,
  'GET /api/dashboard/kpis': () => mockData.mockKpis,
  'GET /api/candidates/search': (path, body, query) => {
    const searchQuery = query?.q?.toLowerCase() || '';
    let filtered = Object.values(mockData.mockCandidatesDetail);
    if (searchQuery) {
      filtered = filtered.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchQuery)) ||
        (c.email && c.email.toLowerCase().includes(searchQuery)) ||
        (c.candidate_id && c.candidate_id.toLowerCase().includes(searchQuery)) ||
        (c.role_applied && c.role_applied.toLowerCase().includes(searchQuery))
      );
    }
    return { candidates: filtered, total: filtered.length, results: filtered };
  },
  'GET /api/candidates': (path, body, query) => {
    let filtered = Object.values(mockData.mockCandidatesDetail);
    if (query?.status) {
      filtered = filtered.filter(c => c.status === query.status);
    }
    if (query?.role) {
      filtered = filtered.filter(c => c.role_applied && c.role_applied.toLowerCase().includes(query.role.toLowerCase()));
    }
    return { candidates: filtered, results: filtered, total: filtered.length };
  },
  'GET /api/interviews/yet-to-interview': (path, body, query) => {
    // Filter candidates that are yet to interview from all candidates
    let filtered = Object.values(mockData.mockCandidatesDetail).filter(c => 
      c.status === 'yet_to_interview' || c.status === 'Yet to Interview'
    );
    if (query?.role) {
      filtered = filtered.filter(c => c.role_applied.toLowerCase().includes(query.role.toLowerCase()));
    }
    if (query?.eligibility) {
      filtered = filtered.filter(c => c.eligibility === query.eligibility);
    }
    return { 
      candidates: filtered,
      results: filtered, 
      total: filtered.length 
    };
  },
  'GET /api/interviews/completed': (path, body, query) => {
    // Filter candidates that have been interviewed from all candidates
    let filtered = Object.values(mockData.mockCandidatesDetail)
      .filter(c => c.status === 'interview_completed' || c.interview_status)
      .map(c => ({
        ...c,
        candidate_name: c.name, // Map name to candidate_name
        interviewer_name: 'Admin User' // Default interviewer
      }));
    
    if (query?.role) {
      filtered = filtered.filter(c => c.role_applied.toLowerCase().includes(query.role.toLowerCase()));
    }
    if (query?.decision) {
      filtered = filtered.filter(c => c.interview_status === query.decision || c.decision === query.decision);
    }
    return { 
      interviews: filtered,
      results: filtered, 
      total: filtered.length 
    };
  },
  'POST /api/candidates': (path, body) => {
    // Generate a new candidate ID
    const newId = `TPEML-${new Date().getFullYear()}-ENG-${String(Object.keys(mockData.mockCandidatesDetail).length + 1).padStart(5, '0')}`;
    const newCandidate = {
      id: newId,
      candidate_id: newId,
      name: body?.name || 'New Candidate',
      email: body?.email || 'candidate@example.com',
      phone: body?.phone || '',
      role: body?.role_applied || 'Engineer',
      role_applied: body?.role_applied || 'Engineer',
      status: 'yet_to_interview',
      eligibility: 'pending',
      experience_years: body?.experience_years || 0,
      qualifications: body?.qualifications || '',
      created_at: new Date().toISOString(),
      ...body
    };
    mockData.mockCandidatesDetail[newId] = newCandidate;
    return { success: true, candidate: newCandidate, candidate_id: newId, id: newId };
  },
  'POST /api/interviews/submit': (path, body) => {
    const candidateId = body?.candidate_id;
    if (candidateId && mockData.mockCandidatesDetail[candidateId]) {
      const candidate = mockData.mockCandidatesDetail[candidateId];
      // Move to interview_completed status
      candidate.status = 'interview_completed';
      candidate.interview_status = body?.decision === 'shortlist' ? 'selected' : 'rejected';
      candidate.interview_notes = body?.notes || '';
      candidate.interview_date = new Date().toISOString().split('T')[0];
      candidate.decision = body?.decision === 'shortlist' ? 'selected' : 'rejected';
    }
    return { success: true, message: 'Interview submitted successfully' };
  },
  'GET /api/re-interview-requests': () => ({ results: mockData.mockReInterviewRequests }),
  'GET /api/reports': () => mockData.mockReports,
  'GET /api/audit': () => ({ results: mockData.mockAuditLogs }),
  'GET /api/sync': () => mockData.mockSyncStatus,
};

function getMockResponse(method, path, body = null) {
  // Special handling for candidate by ID
  if (method === 'GET' && path.includes('/api/candidates/id/')) {
    const candidateId = path.split('/').pop().split('?')[0];
    const candidate = mockData.mockCandidatesDetail[candidateId];
    if (candidate) {
      return candidate;
    }
    throw new Error(`Candidate ${candidateId} not found`);
  }

  // Parse query parameters from URL
  const [pathWithoutQuery, queryString] = path.split('?');
  const query = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      query[key] = value;
    });
  }

  const key = `${method} ${pathWithoutQuery}`;
  const handler = Object.entries(mockRouter).find(([k]) => {
    const pattern = k.replace(/:\w+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(key);
  })?.[1];

  if (handler) {
    return handler(pathWithoutQuery, body, query);
  }
  
  // Default mock responses
  if (method === 'POST') return { success: true };
  if (method === 'GET') return { results: [] };
  throw new Error(`No mock found for ${method} ${path}`);
}

function getToken() {
  return localStorage.getItem('tpeml_token');
}

function getHeaders(useAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (useAuth && t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

export async function api(method, path, body = null, useAuth = true) {
  // Use mock API if enabled
  if (USE_MOCK_API) {
    return new Promise(resolve => {
      setTimeout(() => {
        try {
          resolve(getMockResponse(method, path, body));
        } catch (err) {
          throw err;
        }
      }, 300); // Small delay to simulate network
    });
  }

  const opts = { method, headers: getHeaders(useAuth) };
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(`${BASE}${path}`, opts);
  if (r.status === 401) {
    // Parse error message first
    const j = await r.json().catch(() => ({}));
    const errorMsg = j.detail || j.message || 'Invalid email or password';
    
    // Don't redirect if this is a login request - let the login page handle the error
    if (!path.includes('/auth/login')) {
      localStorage.removeItem('tpeml_token');
      localStorage.removeItem('tpeml_user');
      window.location.href = '/login';
    }
    
    throw new Error(errorMsg);
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.detail || j.message || `Request failed: ${r.status}`);
  }
  const contentType = r.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) return r.json();
  return r;
}

export async function apiBlob(method, path, useAuth = true) {
  if (USE_MOCK_API) {
    // Return a mock blob for mock API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(new Blob(['mock data'], { type: 'application/octet-stream' }));
      }, 300);
    });
  }

  const opts = { method, headers: getHeaders(useAuth) };
  const r = await fetch(`${BASE}${path}`, opts);
  if (r.status === 401) {
    localStorage.removeItem('tpeml_token');
    localStorage.removeItem('tpeml_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.blob();
}
