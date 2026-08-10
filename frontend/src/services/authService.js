import api from './api';

export const authService = {
  login: async (email, password) => {
    // POST /api/identity/auth/login
    // Payload: { email, password }
    // Response: { accessToken, email, role }
    const response = await api.post('/api/identity/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    // POST /api/identity/users
    // Payload: { firstName, lastName, email, password, phoneNumber }
    // Response: ApiResponse<UserResponse>
    const response = await api.post('/api/identity/users', userData);
    return response.data;
  },
};
