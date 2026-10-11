import api from './api';

/**
 * addressService — API operations for user delivery addresses.
 *
 * All methods use the /me/addresses endpoint, deriving ownership
 * strictly from the server-side security context.
 *
 * Backend returns ApiResponse<T> where .data contains the actual payload.
 */
export const addressService = {
  /**
   * GET /api/identity/users/me/addresses
   * Returns list of addresses for the logged-in user.
   * @returns {Promise<Array>}
   */
  getMyAddresses: async () => {
    const response = await api.get('/api/identity/users/me/addresses');
    return response.data?.data ?? response.data ?? [];
  },

  /**
   * GET /api/identity/users/me/addresses/:id
   * @param {number|string} addressId
   * @returns {Promise<Object>}
   */
  getAddressById: async (addressId) => {
    const response = await api.get(`/api/identity/users/me/addresses/${addressId}`);
    return response.data?.data ?? response.data;
  },

  /**
   * POST /api/identity/users/me/addresses
   * @param {Object} addressData
   * @returns {Promise<Object>}
   */
  createAddress: async (addressData) => {
    const response = await api.post('/api/identity/users/me/addresses', addressData);
    return response.data?.data ?? response.data;
  },

  /**
   * PUT /api/identity/users/me/addresses/:id
   * @param {number|string} addressId
   * @param {Object} addressData
   * @returns {Promise<Object>}
   */
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/api/identity/users/me/addresses/${addressId}`, addressData);
    return response.data?.data ?? response.data;
  },

  /**
   * DELETE /api/identity/users/me/addresses/:id
   * @param {number|string} addressId
   * @returns {Promise<Object>}
   */
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/api/identity/users/me/addresses/${addressId}`);
    return response.data?.data ?? response.data;
  },

  /**
   * PATCH /api/identity/users/me/addresses/:id/default
   * @param {number|string} addressId
   * @returns {Promise<Object>}
   */
  setDefaultAddress: async (addressId) => {
    const response = await api.patch(`/api/identity/users/me/addresses/${addressId}/default`);
    return response.data?.data ?? response.data;
  },
};
