import api from "./api";

export const userService = {
  getAllUsers: async () => {
    const res = await api.get("/users");
    return res.data;
  },

  getUsersByRole: async (roleName) => {
    const res = await api.get(`/users/by-role/${roleName}`);
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post("/users", userData);
    return res.data;
  },
};

export default userService;
