import { apiClient } from '../../../services/apiClient.js';
export const notificationService={list:()=>apiClient.get('/notifications'),markRead:(id)=>apiClient.patch(`/notifications/${id}/read`),markAllRead:()=>apiClient.patch('/notifications/read-all')};
