import api from './api';

/**
 * userService — User profile API calls
 *
 * Profile operations use the /me endpoints which derive the user's identity
 * from the gateway-injected X-User-Id header — never from client-supplied data.
 *
 * Backend response shape: ApiResponse<UserResponse>
 *   { success: boolean, message: string, data: UserResponse, timestamp: string }
 *
 * All methods return the inner `data` field (UserResponse) directly.
 */
export const userService = {
  /**
   * GET /api/identity/users/me
   * Returns the currently authenticated user's profile.
   * The backend determines user identity from the gateway-forwarded X-User-Id header.
   */
  getMyProfile: async () => {
    const response = await api.get('/api/identity/users/me');
    // response.data is ApiResponse<UserResponse>; extract the inner .data
    return response.data?.data ?? response.data;
  },

  /**
   * PUT /api/identity/users/me
   * Updates the currently authenticated user's profile.
   * @param {{ firstName: string, lastName: string, phoneNumber: string }} userData
   */
  updateMyProfile: async (userData) => {
    const response = await api.put('/api/identity/users/me', userData);
    return response.data?.data ?? response.data;
  },

  // ── Admin / legacy endpoints ────────────────────────────────────────────────

  /**
   * GET /api/identity/users/{id}
   * Requires ownership (users can only access their own) or ROLE_ADMIN.
   */
  getUserById: async (id) => {
    const response = await api.get(`/api/identity/users/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * GET /api/identity/users
   * Admin-only: returns all registered users.
   */
  getAllUsers: async () => {
    const response = await api.get('/api/identity/users');
    // Returns ApiResponse<List<UserResponse>>; extract the array
    return response.data?.data ?? response.data;
  },

  /**
   * PUT /api/identity/users/{id}
   * Requires ownership or ROLE_ADMIN.
   * @param {number} id
   * @param {{ firstName: string, lastName: string, phoneNumber: string }} userData
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/identity/users/${id}`, userData);
    return response.data?.data ?? response.data;
  },

  /**
   * DELETE /api/identity/users/{id}
   * Admin-only.
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/api/identity/users/${id}`);
    return response.data;
  },
};
