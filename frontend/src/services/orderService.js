import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    // POST /api/orders
    // Payload: { customerId, items: [{ sku, price, quantity }] }
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  getOrderByNumber: async (orderNumber) => {
    // GET /api/orders/{orderNumber}
    const response = await api.get(`/api/orders/${orderNumber}`);
    return response.data;
  },
};
