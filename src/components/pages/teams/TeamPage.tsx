import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  FaArrowLeft,
  FaUsers,
  FaChartLine,
  FaFutbol,
  FaMedal,
  FaSearch,
  FaPlus,
  FaTimes,
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
import { Team, Player, Match, PlayerStat } from "../../../types";
import CreatePlayerModal from "../players/CreatePlayerModal";
import teamService from "../../../services/teamService";
import playerService from "../../../services/playerService";
import roundService from "../../../services/roundService";

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${color} flex items-center justify-between`}
  >
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="text-2xl">{icon}</div>
  </motion.div>
);

const PlayerCard = ({
  player,
  team,
  selectedRoundId,
  onClick,
  onPlayerMatchSelect,
  selectedPlayerId,
  selectedMatchId,
  playerStats,
}: {
  player: Player;
  team: Team;
  selectedRoundId: string | null;
  onClick: (id: string) => void;
  onPlayerMatchSelect: (playerId: string, matchId: string) => void;
  selectedPlayerId: string | null;
  selectedMatchId: string | null;
  playerStats: Record<string, any> | null;
}) => {
  // Calculate player stats for the selected round
  const roundMatches = useMemo(() => {
    if (!selectedRoundId || !team.matches) return [];
    return team.matches.filter(
      (match) => match.round_id.toString() === selectedRoundId
    );
  }, [selectedRoundId, team]);

  const playerRoundStats = useMemo(() => {
    return roundMatches.reduce(
      (stats, match) => {
        const matchStats = player.player_stats?.find(
          (ps) => ps.match_id === match.id
        );
        if (matchStats) {
          stats.goals += matchStats.goals || 0;
          stats.assists += matchStats.assists || 0;
          stats.matches++;
        }
        return stats;
      },
      { goals: 0, assists: 0, matches: 0 }
    );
  }, [roundMatches, player]);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div
        className="flex items-center gap-4"
        onClick={() => onClick(player.id)}
      >
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold">{player.name}</h3>
          {selectedRoundId && (
            <p className="text-sm text-gray-500">
              Estatísticas da Rodada {selectedRoundId}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-sm font-medium">Jogos</p>
          <p className="text-lg">{playerRoundStats.matches}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Gols</p>
          <p className="text-lg">{playerRoundStats.goals}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Assist</p>
          <p className="text-lg">{playerRoundStats.assists}</p>
        </div>
      </div>

      {/* {selectedRoundId && roundMatches.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Partidas nesta rodada:</p>
          <div className="space-y-2">
            {roundMatches.map((match) => (
              <div
                key={match.id}
                className={`p-2 rounded border text-sm ${
                  selectedPlayerId === player.id && selectedMatchId === match.id.toString()
                    ? "bg-blue-50 border-blue-500"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onPlayerMatchSelect(player.id, match.id.toString())}
              >
                <div className="flex justify-between">
                  <span>
                    {match.team_1.name} vs {match.team_2.name}
                  </span>
                  <span>
                    {match.team_1_goals}-{match.team_2_goals}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {selectedPlayerId === player.id && selectedMatchId && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Estatísticas detalhadas:</h4>
          {playerStats?.[`${player.id}-${selectedMatchId}`] ? (
            <div className="text-sm">
              <pre>{JSON.stringify(playerStats[`${player.id}-${selectedMatchId}`], null, 2)}</pre>
            </div>
          ) : (
            <p>Carregando estatísticas...</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative mb-4">
    <input
      type="text"
      placeholder={placeholder}
      className="pl-10 pr-4 py-2 border rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <FaSearch className="absolute left-3 top-3 text-gray-400" />
  </div>
);

const TeamPage: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"players" | "performance">("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(
    location.state?.roundId || null
  );
  const [playersFromTeam, setPlayersFromTeam] = useState<Player[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, any> | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

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
        })
      );

      setPlayersFromTeam(players);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleBackClick = useCallback(() => navigate(-1), [navigate]);
  const handlePlayerClick = useCallback(
    (playerId: string) => navigate(`/players/${playerId}`),
    [navigate]
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
    [id]
  );

  // Fetch player match stats
  const fetchPlayerMatchStats = useCallback(
    async (playerId: string, matchId: string) => {
      try {
        const stats = await playerService.matchStats(playerId, matchId);
        setPlayerStats((prev) => ({
          ...prev,
          [`${playerId}-${matchId}`]: stats,
        }));
      } catch (err) {
        console.error("Failed to fetch player match stats:", err);
      }
    },
    []
  );

  // Handle player/match selection
  const handlePlayerMatchSelect = useCallback(
    (playerId: string, matchId: string) => {
      setSelectedPlayerId(playerId);
      setSelectedMatchId(matchId);

      // Fetch stats if not already in cache
      const cacheKey = `${playerId}-${matchId}`;
      if (!playerStats || !playerStats[cacheKey]) {
        fetchPlayerMatchStats(playerId, matchId);
      }
    },
    [playerStats, fetchPlayerMatchStats]
  );

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!playersFromTeam.length || !team) return null;

    // Calculate total matches based on selected round
    const totalMatches = selectedRoundId
      ? team.matches.filter(
          (m) => m.round_id.toString() === selectedRoundId
        ).length
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
          (m) => m.round_id.toString() === selectedRoundId
        );

        roundMatches.forEach((match) => {
          const matchStats = player.player_stats?.find(
            (ps) => ps.match_id === match.id
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
            (m) => m.round_id.toString() === selectedRoundId
          );

          roundMatches.forEach((match) => {
            const matchStats = player.player_stats?.find(
              (ps) => ps.match_id === match.id
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
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    team={team}
                    selectedRoundId={selectedRoundId}
                    onClick={handlePlayerClick}
                    onPlayerMatchSelect={handlePlayerMatchSelect}
                    selectedPlayerId={selectedPlayerId}
                    selectedMatchId={selectedMatchId}
                    playerStats={playerStats}
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
