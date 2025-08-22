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
  const [fetchingStats, setFetchingStats] = useState<Record<string, boolean>>(
    {},
  );
  const [localStats, setLocalStats] = useState<Record<
    string,
    PlayerMatchStats
  > | null>(null);
  const hasFetchedRef = useRef<Record<string, boolean>>({});

  // Fetch player stats if not available
  const fetchPlayerStats = useCallback(
    async (playerId: number, matchId: number) => {
      if (!teamId || !selectedRoundId) return;

      const cacheKey = `${playerId}-${matchId}`;

      // Mark as fetching
      setFetchingStats((prev) => ({ ...prev, [cacheKey]: true }));


        console.log(`${playerId}-${matchId}-${teamId}-${selectedRoundId}`)

      try {
        const stats = await playerService.matchStats(
          playerId,
          matchId,
          teamId,
          selectedRoundId,
        );

        // Update parent's stats cache
        updatePlayerStats(playerId, matchId, stats);
      } catch (err) {
        console.error("Failed to fetch player match stats:", err);
      } finally {
        // Mark as done fetching
        setFetchingStats((prev) => ({ ...prev, [cacheKey]: false }));
      }
    },
    [teamId, selectedRoundId, updatePlayerStats],
  );

  // Initialize local stats when playerStats prop changes
  useEffect(() => {
    if (playerStats) {
      const playerSpecificStats: Record<string, PlayerMatchStats> = {};

      Object.entries(playerStats).forEach(([key, stats]) => {
        if (key.startsWith(`${player.id}-`)) {
          const matchId = key.split("-")[1];
          playerSpecificStats[matchId] = stats;
        }
      });

      setLocalStats(playerSpecificStats);
    } else {
      setLocalStats(null);
    }
  }, [playerStats, player.id]);

  // Fetch missing stats when component mounts
  useEffect(() => {
    if (teamId && selectedRoundId && roundMatches.length > 0) {
      roundMatches.forEach((match) => {
        const matchId = match.id.toString();
        const cacheKey = `${player.id}-${matchId}`;

        // Skip if we've already fetched or are fetching
        if (hasFetchedRef.current[cacheKey] || fetchingStats[cacheKey]) return;

        // Check if stats already exist in parent cache
        const statsExist = playerStats && playerStats[cacheKey] !== undefined;

        if (!statsExist) {
          fetchPlayerStats(player.id, matchId);
          hasFetchedRef.current[cacheKey] = true;
        }
      });
    }
  }, [teamId, selectedRoundId, roundMatches, player.id]); // Removed playerStats and fetchingStats

  // Calculate player stats for the round
  const playerRoundStats = useMemo(() => {
    if (!localStats) return { goals: 0, assists: 0, matches: 0 };

    return Object.values(localStats).reduce(
      (stats, matchStats) => {
        stats.goals += matchStats.goals_in_match || 0;
        stats.assists += matchStats.assists_in_match || 0;
        stats.matches += matchStats.total_matches_for_a_team || 0;
        return stats;
      },
      { goals: 0, assists: 0, matches: 0 },
    );
  }, [localStats]);

  const performanceRating = useMemo(() => {
    const totalContributions =
      playerRoundStats.goals + playerRoundStats.assists;
    const matches = playerRoundStats.matches || 1;
    return Math.min(10, Math.round((totalContributions / matches) * 2));
  }, [playerRoundStats]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Player Header */}
      <div
        className="bg-gradient-to-r from-blue-50 to-gray-50 p-4 border-b flex items-center gap-4 cursor-pointer"
        onClick={() => onClick(player.id)}
      >
        <div className="relative">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
            <span className="text-blue-600 text-xl font-bold">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {performanceRating > 7 && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
              {performanceRating}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800">{player.name}</h3>
            {player.position && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {player.position}
              </span>
            )}
          </div>

          {selectedRoundId && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <FaCalendarAlt className="text-gray-400" />
              <span>Rodada {selectedRoundId}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <FaRunning />
              <span className="font-bold text-lg">
                {playerRoundStats.matches}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Jogos</p>
          </div>

          <div className="text-center bg-amber-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <FaFutbol />
              <span className="font-bold text-lg">
                {playerRoundStats.goals}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Gols</p>
          </div>

          <div className="text-center bg-green-50 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <FaHandshake />
              <span className="font-bold text-lg">
                {playerRoundStats.assists}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Assist.</p>
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <FaShieldAlt className="text-gray-500" />
            Partidas desta rodada
          </h4>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {roundMatches.length}
          </span>
        </div>

        {matchLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando partidas...</p>
          </div>
        )}

        {matchError && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 text-center">
            <FaInfoCircle className="inline-block mr-2" />
            {matchError}
          </div>
        )}

        {!matchLoading && !matchError && roundMatches.length > 0 && (
          <div className="space-y-3">
            {roundMatches.map((match) => {
              const cacheKey = `${player.id}-${match.id}`;
              const isFetching = fetchingStats[cacheKey];
              const stats = localStats?.[match.id];

              return (
                <div
                  key={match.id}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="grid grid-cols-5 items-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-xs font-bold">
                          {match.team_1?.name?.charAt(0) || "T1"}
                        </span>
                      </div>
                      <p className="text-xs mt-1 truncate">
                        {match.team_1?.name?.split(" ")[0] || "Time 1"}
                      </p>
                    </div>

                    <div className="text-center">
                      <span className="text-lg font-bold">
                        {match.team_1_goals || 0}
                      </span>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                      <div className="text-xs bg-gray-100 rounded-full px-2 py-1">
                        VS
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-lg font-bold">
                        {match.team_2_goals || 0}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-xs font-bold">
                          {match.team_2?.name?.charAt(0) || "T2"}
                        </span>
                      </div>
                      <p className="text-xs mt-1 truncate">
                        {match.team_2?.name?.split(" ")[0] || "Time 2"}
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-500 mt-2">
                    {format(new Date(match.created_at), "dd/MM/yyyy")}
                  </div>

                  {/* Match Stats */}
                  {isFetching && (
                    <div className="mt-3 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-1">
                        Carregando estatísticas...
                      </p>
                    </div>
                  )}

                  {!isFetching && stats && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-blue-50 p-1 rounded">
                        <span className="font-bold">
                          {stats.goals_in_match}
                        </span>{" "}
                        Gols
                      </div>
                      <div className="bg-amber-50 p-1 rounded">
                        <span className="font-bold">
                          {stats.own_goals_in_match}
                        </span>{" "}
                        Contra
                      </div>
                      <div className="bg-green-50 p-1 rounded">
                        <span className="font-bold">
                          {stats.assists_in_match}
                        </span>{" "}
                        Assist
                      </div>
                    </div>
                  )}

                  {!isFetching && !stats && (
                    <div className="mt-3 text-center text-gray-400 text-xs">
                      Estatísticas não disponíveis
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!matchLoading && !matchError && roundMatches.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            Nenhuma partida nesta rodada
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
