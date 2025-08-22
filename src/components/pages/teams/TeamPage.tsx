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
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Team, Player, Match } from "../../../types";
import CreatePlayerModal from "../players/CreatePlayerModal";
import PlayerCard from "../../card/PlayerCard";
import StatCard from "../../card/StatCard";
import SearchInput from "../../search/SearchInput";
import teamService from "../../../services/teamService";
import playerService from "../../../services/playerService";
import roundService from "../../../services/roundService";
import matchService from "../../../services/matchService";

const TeamPage: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: number }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"players" | "performance">(
    "players",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(
    location.state?.roundId || null,
  );
  const [playersFromTeam, setPlayersFromTeam] = useState<Player[]>([]);
  const [playersFromRound, setPlayersFromRound] = useState<Player[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, any> | null>(
    null,
  );
  const [detailedRoundMatches, setDetailedRoundMatches] = useState<Match[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const teamData = await teamService.getById(id!);
      setTeam(teamData);

      const players = await Promise.all(
        teamData.players.map(async (player) => {
          try {
            return await playerService.getById(player.id.toString());
          } catch {
            return player;
          }
        }),
      );

      setPlayersFromTeam(players);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const fetchPlayersFromRound = useCallback(async () => {
    if (!selectedRoundId) return;

    try {
      const roundData = await roundService.getById(selectedRoundId);
      setPlayersFromRound(roundData.players || []);
    } catch (err) {
      console.error("Failed to fetch players from round:", err);
    }
  }, [selectedRoundId]);

  useEffect(() => {
    if (selectedRoundId) {
      fetchPlayersFromRound();
    }
  }, [selectedRoundId, fetchPlayersFromRound]);

  const fetchDetailedMatches = useCallback(async () => {
    if (!selectedRoundId || !team?.matches) {
      setDetailedRoundMatches([]);
      return;
    }

    setMatchLoading(true);
    setMatchError(null);

    try {
      // Filter matches for the round
      const roundMatchIds = team.matches
        .filter((match) => match.round_id.toString() === selectedRoundId)
        .map((match) => match.id.toString());

      // Fetch detailed match data for each match
      const detailedMatches = await Promise.all(
        roundMatchIds.map((id) => matchService.getById(id)),
      );

      setDetailedRoundMatches(detailedMatches);
    } catch (err) {
      setMatchError("Failed to load match details");
      console.error("Error fetching match details:", err);
    } finally {
      setMatchLoading(false);
    }
  }, [selectedRoundId, team]);

  useEffect(() => {
    if (selectedRoundId) {
      fetchDetailedMatches();
    } else {
      setDetailedRoundMatches([]);
    }
  }, [selectedRoundId, fetchDetailedMatches]);

  const updatePlayerStats = useCallback(
    (playerId: number, matchId: number, stats: PlayerMatchStats) => {
      setPlayerStats((prev) => ({
        ...prev,
        [`${playerId}-${matchId}`]: stats,
      }));
    },
    [],
  );

  const handleBackClick = useCallback(() => navigate(-1), [navigate]);
  const handlePlayerClick = useCallback(
    (playerId: number) => navigate(`/players/${playerId}`),
    [navigate],
  );

  const handleCreatePlayer = useCallback(
    async (playerData: { name: string }) => {
      if (!id) return;

      try {
        const newPlayer = await playerService.create({
          ...playerData,
          team_id: parseInt(id),
        });

        setTeam((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: [
              ...prev.players,
              {
                ...newPlayer,
                rounds: [],
                player_stats: [],
              },
            ],
          };
        });

        return newPlayer;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to create player");
      }
    },
    [id],
  );

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!playersFromTeam.length || !team) return null;

    // Calculate total matches based on selected round
    const totalMatches = selectedRoundId
      ? team.matches.filter((m) => m.round_id.toString() === selectedRoundId)
          .length
      : team.matches?.length || 0;

    // Calculate goals and assists for selected round
    let totalGoals = 0;
    let totalAssists = 0;

    playersFromTeam.forEach((player) => {
      if (!selectedRoundId) {
        totalGoals += player.total_goals || 0;
        totalAssists += player.total_assists || 0;
      } else {
        // Filter player stats for selected round
        const roundMatches = team.matches.filter(
          (m) => m.round_id.toString() === selectedRoundId,
        );

        roundMatches.forEach((match) => {
          const matchStats = player.player_stats?.find(
            (ps) => ps.match_id === match.id,
          );
          if (matchStats) {
            totalGoals += matchStats.goals || 0;
            totalAssists += matchStats.assists || 0;
          }
        });
      }
    });

    return {
      totalPlayers: playersFromTeam.length,
      totalGoals,
      totalAssists,
      totalMatches,
      avgGoalsPerPlayer: (totalGoals / playersFromTeam.length).toFixed(1),
    };
  }, [playersFromTeam, team, selectedRoundId]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!playersFromTeam.length || !team) return [];

    return playersFromTeam
      .map((player) => {
        let goals = 0;
        let assists = 0;
        let rounds = 0;

        if (!selectedRoundId) {
          // All rounds
          goals = player.total_goals || 0;
          assists = player.total_assists || 0;
          rounds = player.rounds?.length || 0;
        } else {
          // Specific round
          const roundMatches = team.matches.filter(
            (m) => m.round_id.toString() === selectedRoundId,
          );

          roundMatches.forEach((match) => {
            const matchStats = player.player_stats?.find(
              (ps) => ps.match_id === match.id,
            );
            if (matchStats) {
              goals += matchStats.goals || 0;
              assists += matchStats.assists || 0;
              rounds++;
            }
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
  }, [playersFromTeam, team, selectedRoundId]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!team?.players) return [];
    return team.players.filter((player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [team, searchQuery]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          value={teamStats?.totalGoals || 0}
          icon={<FaMedal className="text-yellow-500" />}
          color="border-yellow-500"
        />
        <StatCard
          title="Média Gols/Jogador"
          value={teamStats?.avgGoalsPerPlayer || "0.0"}
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
                    matchLoading={matchLoading}
                    matchError={matchError}
                    selectedRoundId={selectedRoundId}
                    onClick={handlePlayerClick}
                    teamId={id!} // Pass teamId
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
                      {chartData.map((entry, index) => (
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
                      {chartData.map((entry, index) => (
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
    </div>
  );
};

export default TeamPage;
