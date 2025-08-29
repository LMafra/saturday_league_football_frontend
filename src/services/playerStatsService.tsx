import axios from "axios";

// Base URL for the API
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Axios instance
const api = axios.create({
  baseURL: `${VITE_BASE_URL}/api/v1/player_stats`,
  timeout: 5000, // 5 seconds timeout
});

// PlayerStats API service
const playerStatsService = {
  // Fetch all player stats
  getAll: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Fetch a single player stat by ID
  getById: async (id: number) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Get player stats by match ID
  getByMatchId: async (matchId: number) => {
    const response = await api.get(`/match/${matchId}`);
    return response.data;
  },

  // Create a new player stat
  create: async (data: {
    goals: number;
    own_goals: number;
    assists: number;
    was_goalkeeper: boolean;
    player_id: number;
    team_id: number;
    match_id: number;
  }) => {
    const response = await api.post("/", data);
    return response.data;
  },

  // Update an existing player stat
  update: async (id: number, data: {
    goals: number;
    own_goals: number;
    assists: number;
    was_goalkeeper: boolean;
    player_id: number;
    team_id: number;
    match_id: number;
  }) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete a player stat
  delete: async (id: number) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Bulk create/update player stats for a match
  bulkUpdate: async (matchId: number, playerStats: Array<{
    goals: number;
    own_goals: number;
    assists: number;
    was_goalkeeper: boolean;
    player_id: number;
    team_id: number;
    match_id: number;
  }>) => {
    const response = await api.post(`/match/${matchId}/bulk`, { player_stats: playerStats });
    return response.data;
  },
};

export default playerStatsService;
