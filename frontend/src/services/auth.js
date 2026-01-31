import { api } from './api';

export async function login(email, password) {
  const data = await api('POST', '/api/auth/login', { email, password }, false);
  if (data.access_token) {
    localStorage.setItem('tpeml_token', data.access_token);
    localStorage.setItem('tpeml_user', JSON.stringify(data.user || {}));
  }
  return data;
}

export async function me() {
  return api('GET', '/api/auth/me');
}

export function logout() {
  localStorage.removeItem('tpeml_token');
  localStorage.removeItem('tpeml_user');
}

export function getStoredUser() {
  try {
    const u = localStorage.getItem('tpeml_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('tpeml_token');
}
