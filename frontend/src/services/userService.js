import api from './api';

export const userService = {
  getUserById: async (id) => {
    // GET /api/identity/users/{id}
    const response = await api.get(`/api/identity/users/${id}`);
    return response.data;
  },

  getAllUsers: async () => {
    // GET /api/identity/users (Admin only)
    const response = await api.get('/api/identity/users');
    return response.data;
  },

  updateUser: async (id, userData) => {
    // PUT /api/identity/users/{id}
    // Payload: { firstName, lastName, phoneNumber }
    const response = await api.put(`/api/identity/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    // DELETE /api/identity/users/{id}
    const response = await api.delete(`/api/identity/users/${id}`);
    return response.data;
  },
};
