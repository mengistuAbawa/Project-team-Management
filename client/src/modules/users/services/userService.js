import { apiClient } from '../../../services/apiClient.js';

export const userService = {
  list: (params) => apiClient.get('/users', { params }),
  stats: () => apiClient.get('/users/stats'),
  invitations: () => apiClient.get('/users/invitations'),
  get: (id) => apiClient.get(`/users/${id}`),
  invite: (data) => apiClient.post('/users/invitations', data),
  resendInvitation: (id) => apiClient.post(`/users/invitations/${id}/resend`),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  assignRole: (id, role, confirmSystemAdmin = false) => apiClient.patch(`/users/${id}/role`, { role, confirmSystemAdmin }),
  assignments: (id) => apiClient.get(`/users/${id}/assignments`),
  assignProjects: (id, projectIds) => apiClient.post(`/users/${id}/projects`, { projectIds }),
  assignTeams: (id, teamIds) => apiClient.post(`/users/${id}/teams`, { teamIds }),
  activate: (id) => apiClient.patch(`/users/${id}/activate`),
  deactivate: (id) => apiClient.patch(`/users/${id}/deactivate`),
  suspend: (id) => apiClient.patch(`/users/${id}/suspend`),
  organizations: () => apiClient.get('/organizations'),
  departments: (organizationId) => apiClient.get('/departments', {
    params: organizationId ? { organizationId } : {},
  }),
};
