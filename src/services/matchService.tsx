import axios from "axios";

// Base URL for the API
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Axios instance
const api = axios.create({
  baseURL: `${VITE_BASE_URL}/api/v1/matches`,
  timeout: 5000, // 5 seconds timeout
});

// Match API service
const matchService = {
  // Fetch all match
  getAll: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Fetch a single match by ID
  getById: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create a new match
  create: async (data: unknown) => {
    const response = await api.post("/", data);
    return response.data;
  },

  // Update an existing match
  update: async (id: string, data: unknown) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete a match
  delete: async (id: string) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default matchService;
