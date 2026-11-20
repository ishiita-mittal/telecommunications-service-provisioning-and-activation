
import api from "./api";

const historyService = {
  getAllHistory: async () => {
    const response = await api.get("/order-history");
    return response.data;
  },

  getHistoryById: async (historyId) => {
    const response = await api.get(`/order-history/${historyId}`);
    return response.data;
  },

  getHistoryByOrderId: async (orderId) => {
    const response = await api.get(`/order-history/by-order/${orderId}`);
    return response.data;
  },
};

export default historyService;
