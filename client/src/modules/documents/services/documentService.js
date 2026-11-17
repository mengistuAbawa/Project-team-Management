import { apiClient } from '../../../services/apiClient.js';
export const documentService={list:()=>apiClient.get('/documents'),upload:(formData)=>apiClient.post('/documents',formData,{headers:{'Content-Type':'multipart/form-data'}}),remove:(id)=>apiClient.delete(`/documents/${id}`)};
