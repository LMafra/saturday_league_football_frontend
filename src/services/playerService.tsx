import axios from "axios";

// Base URL for the API
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// Axios instance
const api = axios.create({
  baseURL: `${VITE_BASE_URL}/players`,
  timeout: 5000, // 5 seconds timeout
});

// Player API service
const playerService = {
  // Fetch all player
  getAll: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Fetch a single player by ID
  getById: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create a new player
  create: async (data: unknown) => {
    const response = await api.post("/", data);
    return response.data;
  },

  // Update an existing player
  update: async (id: string, data: unknown) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete a player
  delete: async (id: string) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default playerService;
