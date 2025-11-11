import { BaseService } from "@/shared/api/baseService";
import { Player, PlayerStat } from "@/types";

export interface PlayerFilters extends Record<string, unknown> {
  championship_id?: number;
}

type UpsertPlayerPayload = Partial<
  Omit<Player, "id" | "created_at" | "updated_at" | "player_stats" | "rounds">
>;

interface AddAssociationPayload {
  round_id?: number;
  team_id?: number;
}

// ===== CONCRETE SERVICE IMPLEMENTATION =====
// Player service with specific operations
class PlayerService extends BaseService<Player, UpsertPlayerPayload, UpsertPlayerPayload, PlayerFilters> {
  constructor() {
    super("/players");
  }

  // ===== CRUD Operations =====
  async list(championshipId?: number): Promise<Player[]> {
    const params: PlayerFilters | undefined = championshipId ? { championship_id: championshipId } : undefined;
    return super.getAll(params);
  }

  async findById(id: number): Promise<Player> {
    return super.getById(id);
  }

  async createPlayer(data: UpsertPlayerPayload): Promise<Player> {
    return super.create(data);
  }

  async updatePlayer(id: number, data: UpsertPlayerPayload): Promise<Player> {
    return super.update(id, data);
  }

  async deletePlayer(id: number): Promise<void> {
    return super.delete(id);
  }

  // ===== Business Logic Operations =====
  async addToRound(id: number, roundId: number): Promise<Player> {
    const payload: AddAssociationPayload = { round_id: roundId };
    const response = await this.executeRequest<Player>("POST", `/${id}/add_to_round`, payload);
    return this.handleResponse(response);
  }

  async addToTeam(id: number, teamId: number): Promise<Player> {
    const payload: AddAssociationPayload = { team_id: teamId };
    const response = await this.executeRequest<Player>("POST", `/${id}/add_to_team`, payload);
    return this.handleResponse(response);
  }

  async matchStats(
    id: number,
    matchId: number,
    teamId: number,
    roundId: number,
  ): Promise<PlayerStat[]> {
    const response = await this.executeRequest<PlayerStat[]>(
      "GET",
      `/${id}/match_stats`,
      undefined,
      {
        match_id: matchId,
        team_id: teamId,
        round_id: roundId,
      },
    );
    return this.handleResponse(response);
  }
}

// ===== SINGLETON PATTERN =====
// Export singleton instance
const playerService = new PlayerService();
export default playerService;
