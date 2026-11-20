import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor for clear error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Network error or server is unreachable.";
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data && error.response.data.error) {
        message = error.response.data.error;
      } else {
        message = `Request failed with status ${error.response.status}`;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
