
import api from "./api";

const activationService = {
  getAllRecords: async () => {
    const response = await api.get("/activation/records");
    return response.data;
  },

  getRecordById: async (activationId) => {
    const response = await api.get(`/activation/records/${activationId}`);
    return response.data;
  },

  getTestsByActivationId: async (activationId) => {
    const response = await api.get(
      `/activation/records/${activationId}/tests`
    );
    return response.data;
  },

  getAllTests: async () => {
    const response = await api.get("/activation/tests");
    return response.data;
  },

  getTestById: async (testId) => {
    const response = await api.get(`/activation/tests/${testId}`);
    return response.data;
  },

  runActivationTest: async (activationId, testType, remarks) => {
    const response = await api.post(
      `/activation/records/${activationId}/test`,
      null,
      { params: { testType, remarks } }
    );
    return response.data;
  },
};

export default activationService;
