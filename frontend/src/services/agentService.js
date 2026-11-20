import api from "./api";

export const agentService = {
  getAllAgents: async () => {
    const res = await api.get("/agents");
    return res.data;
  },

  getAgentById: async (id) => {
    const res = await api.get(`/agents/${id}`);
    return res.data;
  },

  getAgentByUserId: async (userId) => {
    const res = await api.get(`/agents/by-user/${userId}`);
    return res.data;
  },

  checkEmployeeCode: async (employeeCode) => {
    const res = await api.get("/agents/employee-code-exists", {
      params: { employeeCode },
    });
    return res.data;
  },

  createAgent: async (agentData) => {
    const res = await api.post("/agents", agentData);
    return res.data;
  },

  updateAgent: async (id, agentData) => {
    const res = await api.put(`/agents/${id}`, agentData);
    return res.data;
  },

  deleteAgent: async (id) => {
    const res = await api.delete(`/agents/${id}`);
    return res.data;
  },
};

export default agentService;
