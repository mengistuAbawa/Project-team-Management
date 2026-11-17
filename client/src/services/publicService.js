import { apiClient } from './apiClient.js';

export function getRequestErrorMessage(error) {
  const response = error.response?.data;
  const validationErrors = response?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length) {
    return validationErrors.map(({ field, message }) => `${field}: ${message}`).join(' ');
  }
  if (Array.isArray(response?.details) && response.details.length) {
    return response.details.map(({ field, message }) => `${field}: ${message}`).join(' ');
  }
  if (response?.message) return response.message;
  if (error.request) return 'The server could not be reached. Check your connection and try again.';
  return 'The request could not be completed. Please try again.';
}

export const publicService = {
  sendContactMessage: (data) => apiClient.post('/public/contact', data),
  submitAccessRequest: (data) => apiClient.post('/public/access-requests', data),
  listContactMessages: (params) => apiClient.get('/admin/public-requests/contact-messages', { params }),
  getContactMessage: (id) => apiClient.get(`/admin/public-requests/contact-messages/${id}`),
  updateContactStatus: (id, status) => apiClient.patch(`/admin/public-requests/contact-messages/${id}/status`, { status }),
  listAccessRequests: (params) => apiClient.get('/admin/public-requests/access-requests', { params }),
  getAccessRequest: (id) => apiClient.get(`/admin/public-requests/access-requests/${id}`),
  reviewAccessRequest: (id, decision) => apiClient.patch(`/admin/public-requests/access-requests/${id}/decision`, decision),
};
