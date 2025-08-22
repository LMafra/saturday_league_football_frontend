import axios from "axios";

// Base URL for the API
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Axios instance
const api = axios.create({
  baseURL: `${VITE_BASE_URL}/api/v1/championships`,
  timeout: 5000, // 5 seconds timeout
});

// Championship API service
const championshipService = {
  // Fetch all championships
  getAll: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Fetch a single championship by ID
  getById: async (id: number) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Create a new championship
  create: async (data: unknown) => {
    const response = await api.post("/", data);
    return response.data;
  },

  // Update an existing championship
  update: async (id: number, data: unknown) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete a championship
  delete: async (id: number) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default championshipService;
