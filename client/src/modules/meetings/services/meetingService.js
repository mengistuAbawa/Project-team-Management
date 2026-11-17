import { apiClient } from '../../../services/apiClient.js';
export const meetingService={list:()=>apiClient.get('/meetings'),create:(data)=>apiClient.post('/meetings',data),update:(id,data)=>apiClient.patch(`/meetings/${id}`,data)};
