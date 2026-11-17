import { apiClient } from '../../../services/apiClient.js';
export const settingsService={get:()=>apiClient.get('/settings'),update:(data)=>apiClient.patch('/settings',data)};
