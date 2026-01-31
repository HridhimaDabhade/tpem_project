import { api } from './api';

export async function syncForms() {
  return api('POST', '/api/sync/forms');
}
