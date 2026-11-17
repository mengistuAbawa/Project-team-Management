import { apiClient } from '../../../services/apiClient.js';
export const dashboardService = { getSummary: () => apiClient.get('/dashboard/summary') };
