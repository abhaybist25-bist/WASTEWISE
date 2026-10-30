import apiClient from './client';

export const donationApi = {
  // Original names
  getActiveDonations: (params) => apiClient.get('/donations', { params }),
  getDonationById: (id) => apiClient.get(`/donations/${id}`),
  createDonation: (data) => apiClient.post('/donations', data),
  updateDonation: (id, data) => apiClient.put(`/donations/${id}`, data),
  cancelDonation: (id, reason) => apiClient.patch(`/donations/${id}/cancel`, { reason }),
  getMyDonations: (params) => apiClient.get('/donations/my', { params }),
  getNearbyDonations: (params) => apiClient.get('/donations/nearby', { params }),
  getDonationHistory: (id) => apiClient.get(`/donations/${id}/history`),
  flagDonation: (id, reason) => apiClient.patch(`/donations/admin/${id}/flag`, { reason }),

  // Convenience aliases used by page components
  getAvailable: (params) => apiClient.get('/donations', { params }),
  getById: (id) => apiClient.get(`/donations/${id}`),
  create: (data) => apiClient.post('/donations', data),
  cancel: (id) => apiClient.patch(`/donations/${id}/cancel`),
  getAll: (params) => apiClient.get('/donations', { params }),
  flag: (id) => apiClient.patch(`/donations/admin/${id}/flag`),
};

