import { apiClient } from '../../../services/apiClient.js';
export const messageService={conversations:()=>apiClient.get('/conversations'),messages:(id)=>apiClient.get(`/conversations/${id}/messages`),send:(id,data)=>apiClient.post(`/conversations/${id}/messages`,data)};
