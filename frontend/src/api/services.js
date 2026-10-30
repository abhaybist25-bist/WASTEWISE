import apiClient from './client';

export const matchingApi = {
  getRecommendations: () => apiClient.get('/matching/recommendations'),
};

export const analyticsApi = {
  getPlatformSummary: () => apiClient.get('/analytics/platform-summary'),
  getDonorAnalytics: () => apiClient.get('/analytics/donor'),
  getRecipientAnalytics: () => apiClient.get('/analytics/recipient'),
  getAdminAnalytics: () => apiClient.get('/analytics/admin'),
};

export const notificationApi = {
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export const adminApi = {
  getPendingOrganizations: (params) => apiClient.get('/admin/organizations/pending', { params }),
  getAllOrganizations: (params) => apiClient.get('/admin/organizations', { params }),
  updateOrganizationVerification: (id, data) => apiClient.patch(`/admin/organizations/${id}/verification`, data),
  updateVerification: (id, data) => apiClient.patch(`/admin/organizations/${id}/verification`, data),
  getAllUsers: (params) => apiClient.get('/users', { params }),
  toggleUserStatus: (id, data) => apiClient.patch(`/users/${id}/toggle-status`, data),
};

export const aiApi = {
  getInsights: () => apiClient.get('/ai/insights'),
  getDonorInsights: () => apiClient.get('/ai/insights'),
  generateInsights: () => apiClient.post('/ai/insights/generate'),
};

export const reportApi = {
  createReport: (data) => apiClient.post('/reports', data),
  getAll: (params) => apiClient.get('/admin/reports', { params }),
  getAllReports: (params) => apiClient.get('/admin/reports', { params }),
  updateStatus: (id, data) => apiClient.patch(`/admin/reports/${id}/status`, data),
  updateReportStatus: (id, data) => apiClient.patch(`/admin/reports/${id}/status`, data),
};

