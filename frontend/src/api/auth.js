import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getCurrentUser: () => apiClient.get('/auth/me'),
  getDemoCredentials: () => apiClient.get('/demo/credentials'),
  resetDemoData: () => apiClient.post('/demo/reset'),
};

