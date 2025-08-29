import { useCallback, useState } from "react";

export interface PlayerMatchStatsCache {
  goals_in_match: number;
  own_goals_in_match: number;
  assists_in_match: number;
  total_matches_for_a_team: number;
}

export function usePlayerStatsCache() {
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerMatchStatsCache>>({});

  const updatePlayerStats = useCallback(
    (playerId: number, matchId: number, stats: PlayerMatchStatsCache) => {
      setPlayerStats((prev) => ({
        ...prev,
        [`${playerId}-${matchId}`]: stats,
      }));
    },
    [],
  );

  return { playerStats, updatePlayerStats } as const;
}


