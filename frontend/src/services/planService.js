import api from "./api";

export const planService = {
  getAllPlans: async () => {
    const res = await api.get("/plans");
    return res.data;
  },

  getAvailablePlans: async () => {
    const res = await api.get("/plans/available");
    return res.data;
  },

  getPlanById: async (id) => {
    const res = await api.get(`/plans/${id}`);
    return res.data;
  },

  createPlan: async (planData) => {
    const res = await api.post("/plans", planData);
    return res.data;
  },

  updatePlan: async (id, planData) => {
    const res = await api.put(`/plans/${id}`, planData);
    return res.data;
  },

  deletePlan: async (id) => {
    const res = await api.delete(`/plans/${id}`);
    return res.data;
  },
};

export default planService;
