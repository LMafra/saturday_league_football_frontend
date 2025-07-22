import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  FaArrowLeft,
  FaUsers,
  FaChartLine,
  FaFutbol,
  FaMedal,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
import teamService from "../../../services/teamService";
import { Team, Player, PlayerStat } from "../../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import playerService from "../../../services/playerService";
import roundService from "../../../services/roundService";
import CreatePlayerModal from "../players/CreatePlayerModal";

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
  onClick,
}: {
  player: Player;
  onClick: (id: string) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(player.id)}
    className="bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 font-bold">
          {player.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h3 className="font-semibold">{player.name}</h3>
        <p className="text-sm text-gray-500">
          Participou de{" "}
          <span className="font-medium">{player.rounds?.length || 0}</span>{" "}
          rodadas
        </p>
      </div>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      <div className="text-center">
        <p className="text-sm font-medium">Jogos</p>
        <p className="text-lg">{player.rounds?.length || 0}</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Gols</p>
        <p className="text-lg">{player.total_goals || 0}</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Assist</p>
        <p className="text-lg">{player.total_assists || 0}</p>
      </div>
    </div>
  </motion.div>
);

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
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [activeTab, setActiveTab] = useState<"players" | "performance">(
    "players",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [playersFromRound, setPlayersFromRound] = useState<Player[]>([]);
  const navigate = useNavigate();

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const teamData = await teamService.getById(id!);
      setTeam(teamData);

      const playersWithStats = await Promise.all(
        teamData.players.map(async (player) => {
          try {
            const playerData = await playerService.getById(
              player.id.toString(),
            );
            return playerData;
          } catch {
            return player;
          }
        }),
      );

      setPlayerStats(playersWithStats);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    fetchTeamData();
  }, [fetchTeamData]);

  useEffect(() => {
    if (selectedRoundId) {
      fetchPlayersFromRound();
    }
  }, [selectedRoundId, fetchPlayersFromRound]);

  const handleBackClick = useCallback(() => navigate(-1), [navigate]);
  const handlePlayerClick = useCallback(
    (playerId: string) => navigate(`/players/${playerId}`),
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

        const playerDataFull = await playerService.getById(
          newPlayer.id.toString(),
        );
        setPlayerStats((prev) => [...prev, playerDataFull]);

        return newPlayer;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to create player");
      }
    },
    [id],
  );

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!playerStats.length) return null;

    return {
      totalPlayers: playerStats.length,
      totalRounds: new Set(
        playerStats.flatMap((p) => p.rounds.map((r) => r.id)),
      ).size,
      totalGoals: playerStats.reduce(
        (sum, player) =>
          sum +
          (player.player_stats?.reduce((pSum, stat) => pSum + stat.goals, 0) ||
            0),
        0,
      ),
      totalAssists: playerStats.reduce(
        (sum, player) =>
          sum +
          (player.player_stats?.reduce(
            (pSum, stat) => pSum + stat.assists,
            0,
          ) || 0),
        0,
      ),
      avgGoalsPerPlayer: (
        playerStats.reduce(
          (sum, player) =>
            sum +
            (player.player_stats?.reduce(
              (pSum, stat) => pSum + stat.goals,
              0,
            ) || 0),
          0,
        ) / playerStats.length
      ).toFixed(1),
    };
  }, [playerStats]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!playerStats.length) return [];

    return playerStats
      .map((player) => ({
        name: player.name.split(" ")[0], // First name only
        goals:
          player.player_stats?.reduce((sum, stat) => sum + stat.goals, 0) || 0,
        assists:
          player.player_stats?.reduce((sum, stat) => sum + stat.assists, 0) ||
          0,
        rounds: player.rounds?.length || 0,
      }))
      .sort((a, b) => b.goals - a.goals);
  }, [playerStats]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!team?.players) return [];
    return team.players.filter((player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [team, searchQuery]);

  if (loading) return <div className="text-center py-12">Carregando...</div>;
  if (error)
    return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!team)
    return <div className="text-center py-12">Time não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-24">
      {/* Create Player Modal */}
      <CreatePlayerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePlayer}
        context="team"
        championshipId={null}
        currentPlayers={team?.players || []}
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
          title="Total Rodadas"
          value={teamStats?.totalRounds || 0}
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
                {/* Add Player Button */}
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
                    onClick={handlePlayerClick}
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
