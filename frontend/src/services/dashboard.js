import { api } from './api';

export async function getKpis() {
  return api('GET', '/api/dashboard/kpis');
}
