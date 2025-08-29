import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Match, Player } from "../../types";
import {
  FaFutbol,
  FaRunning,
  FaHandshake,
  FaCalendarAlt,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";
import playerService from "../../services/playerService";

// ===== DATA STRUCTURES =====
interface PlayerMatchStats {
  goals_in_match: number;
  own_goals_in_match: number;
  assists_in_match: number;
  total_matches_for_a_team: number;
}

interface PlayerCardProps {
  player: Player;
  roundMatches: Match[];
  matchLoading: boolean;
  matchError: string | null;
  selectedRoundId: number | null;
  onClick: (id: number) => void;
  teamId: number;
  playerStats: Record<string, PlayerMatchStats> | null;
  updatePlayerStats: (
    playerId: number,
    matchId: number,
    stats: PlayerMatchStats,
  ) => void;
}

// ===== BEHAVIORAL PATTERN: Strategy Pattern =====
// Strategy for determining which matches to show
interface MatchSelectionStrategy {
  selectMatches(
    roundMatches: Match[],
    player: Player,
    selectedRoundId: number | null
  ): { matches: Match[]; source: string };
}

class EmbeddedPlayerStrategy implements MatchSelectionStrategy {
  selectMatches(
    roundMatches: Match[],
    player: Player,
    selectedRoundId: number | null
  ): { matches: Match[]; source: string } {
    const playerMatches = roundMatches.filter((match: Match) => {
      const inTeam1 = match.team_1_players?.some(p => p.id === player.id);
      const inTeam2 = match.team_2_players?.some(p => p.id === player.id);
      return inTeam1 || inTeam2;
    });

    if (selectedRoundId) {
      const roundMatches = playerMatches.filter((match: Match) =>
        match.round_id === Number(selectedRoundId)
      );
      return { matches: roundMatches, source: "embedded_round" };
    }
    return { matches: playerMatches, source: "embedded" };
  }
}

class PlayerStatsStrategy implements MatchSelectionStrategy {
  selectMatches(
    roundMatches: Match[],
    player: Player,
    selectedRoundId: number | null
  ): { matches: Match[]; source: string } {
    if (!player.player_stats || player.player_stats.length === 0) {
      return { matches: [], source: "none" };
    }

    const matchIds = new Set(player.player_stats.map(ps => ps.match_id));
    const statsMatches = roundMatches.filter((match: Match) => matchIds.has(match.id));

    if (selectedRoundId) {
      const roundMatches = statsMatches.filter((match: Match) =>
        match.round_id === Number(selectedRoundId)
      );
      return { matches: roundMatches, source: "player_stats_round" };
    }
    return { matches: statsMatches, source: "player_stats" };
  }
}

// ===== CREATIONAL PATTERN: Factory Pattern =====
// Factory for match selection strategies
class MatchSelectionFactory {
  private static strategies: Map<string, MatchSelectionStrategy> = new Map([
    ['embedded', new EmbeddedPlayerStrategy()],
    ['playerStats', new PlayerStatsStrategy()]
  ]);

  static getStrategy(type: 'embedded' | 'playerStats'): MatchSelectionStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown strategy type: ${type}`);
    }
    return strategy;
  }
}

// ===== BEHAVIORAL PATTERN: Observer Pattern =====
// Observer for stats fetching state
interface StatsFetchingObserver {
  onStatsFetchingChange(playerId: number, matchId: number, isFetching: boolean): void;
  onStatsUpdate(playerId: number, matchId: number, stats: PlayerMatchStats): void;
}

// ===== STRUCTURAL PATTERN: Adapter Pattern =====
// Adapter for player data processing
class PlayerDataAdapter {
  static adaptPlayerStats(player: Player): {
    totalGoals: number;
    totalAssists: number;
    totalOwnGoals: number;
    totalMatches: number;
  } {
    return {
      totalGoals: player.total_goals || 0,
      totalAssists: player.total_assists || 0,
      totalOwnGoals: player.total_own_goals || 0,
      totalMatches: 0, // player.total_matches doesn't exist in Player type
    };
  }

  static adaptMatchData(matches: Match[]): {
    matchCount: number;
    roundIds: number[];
  } {
    return {
      matchCount: matches.length,
      roundIds: [...new Set(matches.map(m => m.round_id))],
    };
  }
}

// ===== COMPONENT FACTORY =====
class PlayerCardComponentFactory {
  static createStatIcon(type: 'goals' | 'assists' | 'ownGoals' | 'matches') {
    const iconMap = {
      goals: FaFutbol,
      assists: FaHandshake,
      ownGoals: FaShieldAlt,
      matches: FaRunning,
    };
    return iconMap[type];
  }

  static createStatDisplay(
    icon: React.ComponentType,
    value: number,
    label: string,
    color: string
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        {React.createElement(icon, { className: `text-${color}-500` })}
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </motion.div>
    );
  }
}

// ===== MAIN COMPONENT =====
const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  roundMatches,
  matchLoading,
  matchError,
  selectedRoundId,
  onClick,
  teamId,
  playerStats,
  updatePlayerStats,
}) => {
  const [fetchingStats, setFetchingStats] = useState<Record<string, boolean>>({});
  const [localStats, setLocalStats] = useState<Record<string, PlayerMatchStats> | null>(null);
  const hasFetchedRef = useRef<Record<string, boolean>>({});

  // ===== STRATEGY PATTERN IMPLEMENTATION =====
  const { matches: matchesToShow, source: matchSource } = useMemo(() => {
    if (!roundMatches || roundMatches.length === 0) {
      return { matches: [], source: "none" };
    }

    // Try embedded strategy first
    const embeddedStrategy = MatchSelectionFactory.getStrategy('embedded');
    const embeddedResult = embeddedStrategy.selectMatches(roundMatches, player, selectedRoundId);

    if (embeddedResult.matches.length > 0) {
      return embeddedResult;
    }

    // Fallback to player stats strategy
    const statsStrategy = MatchSelectionFactory.getStrategy('playerStats');
    return statsStrategy.selectMatches(roundMatches, player, selectedRoundId);
  }, [roundMatches, player, selectedRoundId]);

  // ===== OBSERVER PATTERN IMPLEMENTATION =====
  const statsObserver: StatsFetchingObserver = useCallback({
    onStatsFetchingChange: (playerId: number, matchId: number, isFetching: boolean) => {
      const cacheKey = `${playerId}-${matchId}`;
      setFetchingStats(prev => ({ ...prev, [cacheKey]: isFetching }));
    },
    onStatsUpdate: (playerId: number, matchId: number, stats: PlayerMatchStats) => {
      const cacheKey = `${playerId}-${matchId}`;
      setLocalStats(prev => ({ ...prev, [cacheKey]: stats }));
    }
  }, [setFetchingStats, setLocalStats]);

  // Fetch player stats if not available
  const fetchPlayerStats = useCallback(
    async (playerId: number, matchId: number, matchRoundId: number) => {
      if (!teamId) return;

      const cacheKey = `${playerId}-${matchId}`;
      if (hasFetchedRef.current[cacheKey]) return;

      statsObserver.onStatsFetchingChange(playerId, matchId, true);
      hasFetchedRef.current[cacheKey] = true;

      try {
        const stats = await playerService.matchStats(
          playerId,
          Number(matchId),
          teamId,
          matchRoundId,
        );

        updatePlayerStats(playerId, matchId, stats as PlayerMatchStats);
        statsObserver.onStatsUpdate(playerId, matchId, stats as PlayerMatchStats);
      } catch (err: unknown) {
        console.error("❌ Failed to fetch player match stats:", err);
      } finally {
        statsObserver.onStatsFetchingChange(playerId, matchId, false);
      }
    },
    [teamId, updatePlayerStats, statsObserver]
  );

  // Fetch missing stats when component mounts
  useEffect(() => {
    matchesToShow.forEach((match: Match) => {
      const cacheKey = `${player.id}-${match.id}`;
      if (!playerStats?.[cacheKey] && !hasFetchedRef.current[cacheKey]) {
        fetchPlayerStats(player.id, match.id, match.round_id);
      }
    });
  }, [matchesToShow, player.id, playerStats, fetchPlayerStats]);

  // ===== DATA ADAPTER USAGE =====
  const playerStatsData = PlayerDataAdapter.adaptPlayerStats(player);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(player.id)}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{player.name}</h3>
        <FaInfoCircle className="text-gray-400" />
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {PlayerCardComponentFactory.createStatDisplay(
          PlayerCardComponentFactory.createStatIcon('goals'),
          playerStatsData.totalGoals,
          'Gols',
          'green'
        )}
        {PlayerCardComponentFactory.createStatDisplay(
          PlayerCardComponentFactory.createStatIcon('assists'),
          playerStatsData.totalAssists,
          'Assistências',
          'blue'
        )}
        {PlayerCardComponentFactory.createStatDisplay(
          PlayerCardComponentFactory.createStatIcon('ownGoals'),
          playerStatsData.totalOwnGoals,
          'Gols Contra',
          'red'
        )}
        {PlayerCardComponentFactory.createStatDisplay(
          PlayerCardComponentFactory.createStatIcon('matches'),
          playerStatsData.totalMatches,
          'Partidas',
          'purple'
        )}
      </div>

      {/* Match Information */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-2">
          <FaCalendarAlt className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {selectedRoundId ? `Partidas da rodada ${selectedRoundId}` : 'Partidas do jogador'}
          </span>
        </div>

        {matchSource !== "none" && (
          <div className="text-xs text-gray-500 mb-2">
            Fonte: {matchSource === "embedded" ? "times da partida" :
                   matchSource === "player_stats" ? "estatísticas do jogador" :
                   matchSource === "embedded_round" ? "times da partida (rodada)" :
                   "estatísticas do jogador (rodada)"}
          </div>
        )}

        {matchLoading ? (
          <div className="text-sm text-gray-500">Carregando partidas...</div>
        ) : matchError ? (
          <div className="text-sm text-red-500">Erro ao carregar partidas</div>
        ) : matchesToShow.length === 0 ? (
          <div className="text-sm text-gray-500">
            {selectedRoundId ? "Nenhuma partida nesta rodada" : "Nenhuma partida encontrada"}
          </div>
        ) : (
          <div className="space-y-2">
            {matchesToShow.map((match: Match) => {
              const cacheKey = `${player.id}-${match.id}`;
              const stats = playerStats?.[cacheKey] || localStats?.[cacheKey];
              const isFetching = fetchingStats[cacheKey];

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{match.name}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(match.created_at), "dd/MM/yyyy")}
                    </div>
                  </div>

                  {isFetching ? (
                    <div className="text-xs text-gray-500">Carregando...</div>
                  ) : stats ? (
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-600">⚽ {stats.goals_in_match}</span>
                      <span className="text-blue-600">👁️ {stats.assists_in_match}</span>
                      <span className="text-red-600">🛡️ {stats.own_goals_in_match}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Sem dados</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
