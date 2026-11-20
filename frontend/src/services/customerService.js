import api from "./api";

export const customerService = {
  getAllCustomers: async () => {
    const res = await api.get("/customers");
    return res.data;
  },

  getCustomerById: async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },

  getCustomerByUserId: async (userId) => {
    const res = await api.get(`/customers/by-user/${userId}`);
    return res.data;
  },

  createCustomer: async (customerData) => {
    const res = await api.post("/customers", customerData);
    return res.data;
  },

  updateCustomer: async (id, customerData) => {
    const res = await api.put(`/customers/${id}`, customerData);
    return res.data;
  },

  deleteCustomer: async (id) => {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  },
};

export default customerService;
