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
   * @returns {InventoryResponse} — { sku, availableQuantity, reservedQuantity }
   */
  getInventoryBySku: async (sku) => {
    const response = await api.get(`/api/inventory/items/sku/${sku}`);
    // response.data = ApiResponse<InventoryResponse>; unwrap the inner .data
    return response.data?.data ?? response.data;
  },
};
