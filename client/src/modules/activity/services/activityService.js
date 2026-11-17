import { apiClient } from '../../../services/apiClient.js';
export const activityService={list:(params)=>apiClient.get('/activity',{params})};
