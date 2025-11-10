import { BaseService } from "./baseService";
import { Round, Team } from "../types";

// ===== CONCRETE SERVICE IMPLEMENTATION =====
// Player service with specific operations
class PlayerService extends BaseService {
  constructor() {
    super('/players');
  }

  // ===== CRUD Operations =====
  async getAll(championshipId?: number): Promise<unknown> {
    const params = championshipId ? { championship_id: championshipId } : {};
    return super.getAll(params);
  }

  async getById(id: number): Promise<unknown> {
    return super.getById(id);
  }

  async create(data: unknown): Promise<unknown> {
    return super.create(data);
  }

  async update(id: number, data: unknown): Promise<unknown> {
    return super.update(id, data);
  }

  async delete(id: number): Promise<unknown> {
    return super.delete(id);
  }

  // ===== Business Logic Operations =====
  async addToRound(id: number, roundId: number): Promise<Round> {
    try {
      const response = await this.executeRequest('POST', `/${id}/add_to_round`, {
        round_id: roundId,
      });
      return this.handleResponse<Round>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addToTeam(id: number, teamId: number): Promise<Team> {
    try {
      const response = await this.executeRequest('POST', `/${id}/add_to_team`, {
        team_id: teamId,
      });
      return this.handleResponse<Team>(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async matchStats(
    id: number,
    matchId: number,
    teamId: number,
    roundId: number,
  ): Promise<unknown> {
    try {
      const response = await this.executeRequest('GET', `/${id}/match_stats`, undefined, {
        match_id: matchId,
        team_id: teamId,
        round_id: roundId,
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// ===== SINGLETON PATTERN =====
// Export singleton instance
const playerService = new PlayerService();
export default playerService;
