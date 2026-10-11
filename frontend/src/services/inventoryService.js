import api from './api';

/**
 * inventoryService — Inventory management API calls
 *
 * All methods unwrap the backend's ApiResponse<T> wrapper internally.
 * Backend shape: ApiResponse<InventoryResponse>
 */
export const inventoryService = {
  /**
   * GET /api/inventory/items/sku/{sku}
   * @param {string} sku
   * @returns {Promise<Array>} — List of warehouse inventory items
   */
  getInventoryBySku: async (sku) => {
    const response = await api.get(`/api/inventory/items/sku/${sku}`);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  },
};
