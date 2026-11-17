import { apiClient } from '../../../services/apiClient.js';
export const taskService={list:(params)=>apiClient.get('/tasks',{params}),get:(id)=>apiClient.get(`/tasks/${id}`),create:(data)=>apiClient.post('/tasks',data),update:(id,data)=>apiClient.patch(`/tasks/${id}`,data),remove:(id)=>apiClient.delete(`/tasks/${id}`)};
