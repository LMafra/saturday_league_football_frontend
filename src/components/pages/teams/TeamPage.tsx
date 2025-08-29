import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  FaArrowLeft,
  FaUsers,
  FaChartLine,
  FaFutbol,
  FaMedal,
  FaPlus,
  FaHandshake,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Player } from "../../../types";
import CreatePlayerModal from "../players/CreatePlayerModal";
import PlayerCard from "../../card/PlayerCard";
import StatCard from "../../card/StatCard";
import SearchInput from "../../search/SearchInput";
import playerService from "../../../services/playerService";
import roundService from "../../../services/roundService";
import { useTeam } from "../../../hooks/useTeam";
import { useRoundMatches } from "../../../hooks/useRoundMatches";
import { usePlayerStatsCache } from "../../../hooks/usePlayerStatsCache";

const TeamPage: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teamIdNum = id ? parseInt(id, 10) : null;
  const { team, playersFromTeam, loading, error, setTeam, setPlayersFromTeam } = useTeam(teamIdNum);
  const [activeTab, setActiveTab] = useState<"players" | "performance">(
    "players",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(
    location.state?.roundId ?? null,
  );
  const [playersFromRound, setPlayersFromRound] = useState<Player[]>([]);
  const [isLoadingMatchStats, setIsLoadingMatchStats] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { playerStats, updatePlayerStats } = usePlayerStatsCache();
  const { detailedRoundMatches } = useRoundMatches(team?.matches);

  const fetchPlayersFromRound = useCallback(async () => {
    if (!selectedRoundId) return;

    try {
      const roundData = await roundService.getById(selectedRoundId);
      setPlayersFromRound(roundData.players || []);
    } catch (err) {
      console.error("Failed to fetch players from round:", err);
    }
  }, [selectedRoundId]);

  // Fetch match stats for all players in the selected round
  const fetchRoundMatchStats = useCallback(async () => {
    if (!selectedRoundId || !teamIdNum || !playersFromTeam.length) return;

    setIsLoadingMatchStats(true);

    try {
      const roundMatches = (team?.matches ?? []).filter(
        (m) => m.round_id === selectedRoundId,
      );

      // Fetch match stats for each player in each match of the selected round
      for (const player of playersFromTeam) {
        for (const match of roundMatches) {
          const cacheKey = `${player.id}-${match.id}`;

          // Only fetch if not already in cache
          if (!playerStats?.[cacheKey]) {
            try {
              const stats = await playerService.matchStats(
                player.id,
                match.id,
                teamIdNum,
                selectedRoundId,
              );
              updatePlayerStats(player.id, match.id, stats as {
                goals_in_match: number;
                own_goals_in_match: number;
                assists_in_match: number;
                total_matches_for_a_team: number;
              });
            } catch (err) {
              console.error(`Failed to fetch match stats for player ${player.id} in match ${match.id}:`, err);
            }
          }
        }
      }
    } finally {
      setIsLoadingMatchStats(false);
    }
  }, [selectedRoundId, teamIdNum, playersFromTeam, team?.matches, playerStats, updatePlayerStats]);

  useEffect(() => {
    if (selectedRoundId) {
      fetchPlayersFromRound();
      fetchRoundMatchStats();
    }
  }, [selectedRoundId, fetchPlayersFromRound, fetchRoundMatchStats]);

  // Round matches are managed by useRoundMatches

  // Provided by usePlayerStatsCache

  const handleBackClick = useCallback(() => navigate(-1), [navigate]);
  const handlePlayerClick = useCallback(
    (playerId: number) => navigate(`/players/${playerId}`),
    [navigate],
  );

  const handleClose = useCallback(
    (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") return;
      setOpen(false);
    },
    [],
  );

  const handleCreatePlayer = useCallback(
    async (playerData: { name: string }) => {
      if (!id) return;

      try {
        const newPlayer = await playerService.create({
          ...playerData,
          team_id: parseInt(id),
        });

        // Create a complete player object with default values
        const completePlayer: Player = {
          ...(newPlayer as Player),
          rounds: [],
          player_stats: [],
          total_goals: 0,
          total_assists: 0,
          total_own_goals: 0,
        };

        // Update both team and playersFromTeam states
        setTeam((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: [
              ...((prev.players ?? []) as Player[]),
              completePlayer,
            ],
          };
        });

        // Also update the playersFromTeam state directly
        setPlayersFromTeam((prev) => [...prev, completePlayer]);

        // Show success message
        setMessage(`Jogador "${completePlayer.name}" criado com sucesso!`);
        setOpen(true);
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to create player");
      }
    },
    [id, setTeam, setPlayersFromTeam],
  );

  // Calculate team statistics using match stats from playerService
  const teamStats = useMemo(() => {
    if (!playersFromTeam.length || !team) return null;

    // Calculate total matches based on selected round
    const matches = team.matches ?? [];
    const totalMatches = selectedRoundId
      ? matches.filter((m) => m.round_id === selectedRoundId).length
      : matches.length;

    // Calculate goals and assists for selected round using playerStats cache
    let totalGoals = 0;
    let totalAssists = 0;
    let totalOwnGoals = 0;

    playersFromTeam.forEach((player) => {
      if (!selectedRoundId) {
        // For all rounds, use cached stats or fallback to player totals
        const playerMatchStats = Object.entries(playerStats || {}).filter(
          ([key]) => key.startsWith(`${player.id}-`)
        ).map(([, stats]) => stats);

        if (playerMatchStats.length > 0) {
          playerMatchStats.forEach((stats) => {
            totalGoals += stats.goals_in_match || 0;
            totalAssists += stats.assists_in_match || 0;
            totalOwnGoals += stats.own_goals_in_match || 0;
          });
        } else {
          // Fallback to player totals if no match stats available
          totalGoals += player.total_goals || 0;
          totalAssists += player.total_assists || 0;
          totalOwnGoals += player.total_own_goals || 0;
        }
      } else {
        // For specific round, use cached stats for that round's matches
        const roundMatches = (team.matches ?? []).filter(
          (m) => m.round_id === selectedRoundId,
        );

        roundMatches.forEach((match) => {
          const cacheKey = `${player.id}-${match.id}`;
          const matchStats = playerStats?.[cacheKey];

          if (matchStats) {
            totalGoals += matchStats.goals_in_match || 0;
            totalAssists += matchStats.assists_in_match || 0;
            totalOwnGoals += matchStats.own_goals_in_match || 0;
          }
          // Note: We don't fallback to player.player_stats here since we want to use matchStats from playerService
        });
      }
    });

    return {
      totalPlayers: playersFromTeam.length,
      totalGoals,
      totalAssists,
      totalOwnGoals,
      totalMatches,
      avgGoalsPerPlayer: (totalGoals / playersFromTeam.length).toFixed(1),
    };
  }, [playersFromTeam, team, selectedRoundId, playerStats]);


  // Prepare data for charts using match stats from playerService
  const chartData = useMemo(() => {
    if (!playersFromTeam.length || !team) return [];

    return playersFromTeam
      .map((player) => {
        let goals = 0;
        let assists = 0;
        let rounds = 0;

        if (!selectedRoundId) {
          // All rounds - use cached match stats or fallback to player totals
          const playerMatchStats = Object.entries(playerStats || {}).filter(
            ([key]) => key.startsWith(`${player.id}-`)
          ).map(([, stats]) => stats);

          if (playerMatchStats.length > 0) {
            playerMatchStats.forEach((stats) => {
              goals += stats.goals_in_match || 0;
              assists += stats.assists_in_match || 0;
            });
            rounds = playerMatchStats.length;
          } else {
            // Fallback to player totals
            goals = player.total_goals || 0;
            assists = player.total_assists || 0;
            rounds = player.rounds?.length || 0;
          }
        } else {
          // Specific round - use cached stats for that round's matches
          const roundMatches = (team.matches ?? []).filter(
            (m) => m.round_id === selectedRoundId,
          );

          roundMatches.forEach((match) => {
            const cacheKey = `${player.id}-${match.id}`;
            const matchStats = playerStats?.[cacheKey];

            if (matchStats) {
              goals += matchStats.goals_in_match || 0;
              assists += matchStats.assists_in_match || 0;
              rounds++;
            }
            // Note: We don't fallback to player.player_stats here since we want to use matchStats from playerService
          });
        }

        return {
          name: player.name.split(" ")[0],
          goals,
          assists,
          rounds,
        };
      })
      .sort((a, b) => b.goals - a.goals);
  }, [playersFromTeam, team, selectedRoundId, playerStats]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!playersFromTeam.length) return [];
    return playersFromTeam.filter((player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [playersFromTeam, searchQuery]);

  const currentPlayers = useMemo(() => team?.players || [], [team?.players]);

  if (loading) return <div className="text-center py-12">Carregando...</div>;
  if (error)
    return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!team)
    return <div className="text-center py-12">Time não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-24">
      <CreatePlayerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePlayer}
        context="team"
        currentPlayers={currentPlayers}
        playersFromRound={playersFromRound}
        selectedRoundId={selectedRoundId}
        onRoundChange={setSelectedRoundId}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <FaArrowLeft />
              Voltar
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-2xl font-bold">
                  {team.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {team.name}
                </h1>
                <p className="text-gray-600">
                  Criado em: {format(new Date(team.created_at), "dd MMMM yyyy")}
                  {selectedRoundId && isLoadingMatchStats && (
                    <span className="ml-2 text-blue-600 text-sm">
                      • Carregando estatísticas da rodada...
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
            {team.players?.length || 0} Jogadores
          </div>
        </div>
      </motion.div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Jogadores"
          value={teamStats?.totalPlayers || 0}
          icon={<FaUsers className="text-blue-500" />}
          color="border-blue-500"
        />
        <StatCard
          title="Partidas Jogadas"
          value={teamStats?.totalMatches || 0}
          icon={<FaFutbol className="text-green-500" />}
          color="border-green-500"
        />
        <StatCard
          title="Total Gols"
          value={isLoadingMatchStats ? "..." : (teamStats?.totalGoals || 0)}
          icon={<FaMedal className="text-yellow-500" />}
          color="border-yellow-500"
        />
        <StatCard
          title="Total Assistências"
          value={isLoadingMatchStats ? "..." : (teamStats?.totalAssists || 0)}
          icon={<FaHandshake className="text-indigo-500" />}
          color="border-indigo-500"
        />
        <StatCard
          title="Média Gols/Jogador"
          value={isLoadingMatchStats ? "..." : (teamStats?.avgGoalsPerPlayer || "0.0")}
          icon={<FaChartLine className="text-purple-500" />}
          color="border-purple-500"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-t-2xl shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "players"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("players")}
          >
            Jogadores ({team.players?.length || 0})
          </button>
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "performance"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("performance")}
          >
            Desempenho
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl shadow-lg p-6 mb-8">
        {activeTab === "players" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Lista de Jogadores</h2>
              <div className="flex gap-4">
                <div className="w-64">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar jogador..."
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <FaPlus /> Novo Jogador
                </button>
              </div>
            </div>

            {filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    roundMatches={detailedRoundMatches}
                                    matchLoading={false}
                matchError={null}
                    selectedRoundId={selectedRoundId}
                    onClick={handlePlayerClick}
                    teamId={id ? parseInt(id, 10) : 0}
                    playerStats={playerStats}
                    updatePlayerStats={updatePlayerStats}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum jogador encontrado
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                  <FaPlus /> Adicionar primeiro jogador
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Desempenho dos Jogadores
            </h2>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Gols por Jogador</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="goals" name="Gols">
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? "#3B82F6" : "#10B981"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">
                Participação em Rodadas
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rounds" name="Rodadas">
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? "#F59E0B" : "#EF4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={message}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#2563eb",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default TeamPage;
