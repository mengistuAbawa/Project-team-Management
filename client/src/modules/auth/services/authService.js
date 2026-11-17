import { apiClient } from '../../../services/apiClient.js';
export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  acceptInvitation: (payload) => apiClient.post('/auth/accept-invitation', payload),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};
