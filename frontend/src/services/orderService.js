
import api from "./api";

const orderService = {
  getAllOrders: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  updateOrderStatus: async (orderId, status, agentId, remarks) => {
    const response = await api.put(`/orders/${orderId}/status`, null, {
      params: {
        status,
        ...(agentId != null && { agentId }),
        ...(remarks != null && { remarks }),
      },
    });
    return response.data;
  },

  cancelOrder: async (orderId, agentId, remarks) => {
    const response = await api.post(`/orders/${orderId}/cancel`, null, {
      params: {
        ...(agentId != null && { agentId }),
        ...(remarks != null && { remarks }),
      },
    });
    return response.data;
  },
};

export default orderService;
