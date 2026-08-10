import api from './api';

export const inventoryService = {
  getInventoryBySku: async (sku) => {
    // GET /api/inventory/items/sku/{sku}
    const response = await api.get(`/api/inventory/items/sku/${sku}`);
    return response.data;
  },
};
