import { apiClient } from '../../../services/apiClient.js';
export const projectService={list:(params)=>apiClient.get('/projects',{params}),get:(id)=>apiClient.get(`/projects/${id}`),create:(data)=>apiClient.post('/projects',data),update:(id,data)=>apiClient.patch(`/projects/${id}`,data),remove:(id)=>apiClient.delete(`/projects/${id}`)};
