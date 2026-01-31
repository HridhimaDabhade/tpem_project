import { api } from './api';

export async function requestReInterview(candidateId, reason) {
  return api('POST', '/api/re-interview/request', { candidate_id: candidateId, reason });
}

export async function resolveReInterview(requestId, approved) {
  return api('POST', '/api/re-interview/resolve', { request_id: requestId, approved });
}

export async function listPending() {
  return api('GET', '/api/re-interview/pending');
}
