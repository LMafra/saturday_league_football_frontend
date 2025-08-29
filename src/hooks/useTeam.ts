import { useCallback, useEffect, useState } from "react";
import teamService from "../services/teamService";
import playerService from "../services/playerService";
import { Player, Team } from "../types";

export function useTeam(teamId: number | null) {
  const [team, setTeam] = useState<Team | null>(null);
  const [playersFromTeam, setPlayersFromTeam] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const teamData = await teamService.getById(teamId);
      setTeam(teamData);
      const players = await Promise.all(
        (teamData.players ?? []).map(async (player: Player) => {
          try {
            return await playerService.getById(player.id);
          } catch {
            return player;
          }
        }),
      );
      setPlayersFromTeam(players);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  return { team, playersFromTeam, loading, error, setTeam, setPlayersFromTeam };
}


