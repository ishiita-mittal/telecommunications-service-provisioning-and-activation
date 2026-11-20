
import api from "./api";

const resourceService = {
  getAllResources: async () => {
    const response = await api.get("/resources");
    return response.data;
  },

  getAvailableResources: async () => {
    const response = await api.get("/resources/available");
    return response.data;
  },

  getResourceById: async (resourceId) => {
    const response = await api.get(`/resources/${resourceId}`);
    return response.data;
  },

  createResource: async (resourceData) => {
    const response = await api.post("/resources", resourceData);
    return response.data;
  },

  updateResource: async (resourceId, resourceData) => {
    const response = await api.put(`/resources/${resourceId}`, resourceData);
    return response.data;
  },

  deleteResource: async (resourceId) => {
    await api.delete(`/resources/${resourceId}`);
  },
};

export default resourceService;
