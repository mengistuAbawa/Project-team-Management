import { apiClient } from '../../../services/apiClient.js';
export const reviewService={list:()=>apiClient.get('/reviews'),submit:(id,data)=>apiClient.post(`/reviews/${id}`,data),update:(id,data)=>apiClient.patch(`/reviews/${id}`,data)};
