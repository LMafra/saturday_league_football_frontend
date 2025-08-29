import { BaseService } from "./baseService";

// ===== CONCRETE SERVICE IMPLEMENTATION =====
// Team service with specific operations
class TeamService extends BaseService {
  constructor() {
    super('/teams');
  }

  // ===== CRUD Operations =====
  async getAll(): Promise<unknown> {
    return super.getAll();
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
}

// ===== SINGLETON PATTERN =====
// Export singleton instance
const teamService = new TeamService();
export default teamService;
