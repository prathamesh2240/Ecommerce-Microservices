import api from './api';

/**
 * orderService — Order management API calls
 *
 * All methods unwrap the backend's ApiResponse<T> wrapper internally,
 * returning the inner data directly to callers.
 *
 * Backend shape: ApiResponse<OrderResponse>
 */
export const orderService = {
  /**
   * POST /api/orders
   * Creates a new order and triggers the Saga workflow.
   * @param {{ customerId: number, items: Array<{ sku, price, quantity }> }} orderData
   * @returns {OrderResponse} — { orderNumber, orderStatus, items, totalAmount, createdAt }
   */
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    // response.data = ApiResponse<OrderResponse>; unwrap the inner .data
    return response.data?.data ?? response.data;
  },

  /**
   * GET /api/orders/{orderNumber}
   * Fetches order details by business order number.
   * @param {string} orderNumber
   * @returns {OrderResponse}
   */
  getOrderByNumber: async (orderNumber) => {
    const response = await api.get(`/api/orders/${orderNumber}`);
    return response.data?.data ?? response.data;
  },
};
