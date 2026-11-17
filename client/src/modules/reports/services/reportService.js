import { apiClient } from '../../../services/apiClient.js';
export const reportService={summary:()=>apiClient.get('/reports/summary'),project:(id)=>apiClient.get(`/reports/projects/${id}`),export:(params)=>apiClient.get('/reports/export',{params,responseType:'blob'})};
