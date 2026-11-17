import { apiClient } from '../../../services/apiClient.js';
export const teamService={
  list:()=>apiClient.get('/teams'),
  listForProject:(projectId,params)=>apiClient.get(`/projects/${projectId}/teams`,{params}),
  create:(data)=>apiClient.post('/teams',data),
  get:(id)=>apiClient.get(`/teams/${id}`),
  update:(id,data)=>apiClient.patch(`/teams/${id}`,data),
};
