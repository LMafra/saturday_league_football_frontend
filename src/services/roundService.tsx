import axios from "axios";

// Base URL for the API
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Axios instance
const api = axios.create({
  baseURL: `${VITE_BASE_URL}/api/v1/rounds`,
  timeout: 5000, // 5 seconds timeout
});

// Round API service
const roundService = {
  // Fetch all round
  getAll: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Fetch a single round by ID
  getById: async (id: number) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create a new round
  create: async (data: unknown) => {
    const response = await api.post("/", data);
    return response.data;
  },

  // Update an existing round
  update: async (id: number, data: unknown) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete a round
  delete: async (id: number) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default roundService;
