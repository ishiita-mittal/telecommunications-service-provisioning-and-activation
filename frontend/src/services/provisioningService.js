
import api from "./api";

export const provisioningService = {
  getAllTasks: async () => {
    const res = await api.get("/provisioning/tasks");
    return res.data;
  },

  getTaskById: async (taskId) => {
    const res = await api.get(`/provisioning/tasks/${taskId}`);
    return res.data;
  },

  getTasksByStatus: async (status) => {
    const res = await api.get("/provisioning/tasks/by-status", {
      params: { status },
    });
    return res.data;
  },

  startTask: async (taskId, agentId) => {
    const res = await api.post(
      `/provisioning/tasks/${taskId}/start`,
      null,
      { params: agentId ? { agentId } : {} }
    );
    return res.data;
  },

  allocateResource: async (taskId, resourceId) => {
    const res = await api.post(
      `/provisioning/tasks/${taskId}/allocate`,
      null,
      { params: { resourceId } }
    );
    return res.data;
  },

  completeTask: async (taskId, agentId, remarks) => {
    const res = await api.post(
      `/provisioning/tasks/${taskId}/complete`,
      null,
      { params: { agentId, remarks } }
    );
    return res.data;
  },

  getAllAllocations: async () => {
    const res = await api.get("/provisioning/allocations");
    return res.data;
  },
};

export default provisioningService;
