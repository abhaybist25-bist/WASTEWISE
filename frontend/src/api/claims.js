import apiClient from './client';

export const claimApi = {
  claimDonation: (donationId, data) => apiClient.post(`/donations/${donationId}/claims`, data),
  getMyClaims: (params) => apiClient.get('/claims/my', { params }),
  getDonorClaims: (params) => apiClient.get('/claims/donor', { params }),
  getClaimById: (id) => apiClient.get(`/claims/${id}`),
  getClaimsByDonation: (donationId) => apiClient.get(`/donations/${donationId}/claims`),
  updateStatus: (id, data) => apiClient.patch(`/claims/${id}/status`, data),
  confirmPickup: (id, notes) => apiClient.post(`/claims/${id}/pickup-confirmation`, { notes }),
  confirmDelivery: (id, deliveryNotes) => apiClient.post(`/claims/${id}/delivery-confirmation`, { notes: deliveryNotes }),

  // Convenience alias used by DonationDetailPage
  create: (data) => apiClient.post(`/donations/${data.donationId}/claims`, data),
};

