import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { FaArrowLeft, FaFutbol, FaMedal } from "react-icons/fa";
import { motion } from "framer-motion";
import playerService from "../../../services/playerService";
import { Player, PlayerStat } from "../../../types";
import roundService from "../../../services/roundService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GoalIcon } from "lucide-react";
import { GiGoalKeeper } from "react-icons/gi";

// Stat card component
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
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

// Round card component
const RoundCard = ({
  round,
  onClick,
}: {
  round: any;
  onClick: (id: number) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(round.id)}
    className="bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:bg-gray-50 transition-colors"
  >
    <div className="flex justify-between items-center">
      <h3 className="font-semibold">{round.name}</h3>
      <span className="text-sm text-gray-500">
        {format(new Date(round.round_date), "dd MMM yyyy")}
      </span>
    </div>
    <div className="mt-2 text-sm text-gray-600">
      Championship:{" "}
      <span className="font-medium">#{round.championship_id}</span>
    </div>
  </motion.div>
);

// Match stat component
const MatchStatCard = ({ stat }: { stat: PlayerStat }) => (
  <motion.div
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    className="bg-white rounded-xl shadow-sm p-4 border"
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">Match #{stat.match_id}</h3>
        <p className="text-sm text-gray-500">
          Team: <span className="font-medium">#{stat.team_id}</span>
        </p>
      </div>
      <div className="flex gap-2">
        {stat.was_goalkeeper && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <GiGoalKeeper /> GK
          </span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{stat.goals}</p>
        <p className="text-xs text-gray-500">Goals</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{stat.assists}</p>
        <p className="text-xs text-gray-500">Assists</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{stat.own_goals}</p>
        <p className="text-xs text-gray-500">Own Goals</p>
      </div>
    </div>
  </motion.div>
);

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: number }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "rounds" | "matches">(
    "stats",
  );
  const navigate = useNavigate();

  const fetchPlayerData = useCallback(async () => {
    try {
      setLoading(true);
      const playerData = await playerService.getById(id!);

      // Fetch additional round details
      const roundsWithDetails = await Promise.all(
        playerData.rounds.map(async (round) => {
          try {
            const roundDetails = await roundService.getById(
              round.id.toString(),
            );
            return roundDetails;
          } catch {
            return round; // Fallback to basic data if fetch fails
          }
        }),
      );

      setPlayer({
        ...playerData,
        rounds: roundsWithDetails,
      });
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
    fetchPlayerData();
  }, [fetchPlayerData]);

  const handleBackClick = useCallback(() => navigate(-1), [navigate]);
  const handleRoundClick = useCallback(
    (roundId: number) => navigate(`/rounds/${roundId}`),
    [navigate],
  );

  // Calculate aggregated statistics
  const playerStats = useMemo(() => {
    if (!player) return null;

    return player.player_stats.reduce(
      (acc, stat) => ({
        totalGoals: acc.totalGoals + stat.goals,
        totalAssists: acc.totalAssists + stat.assists,
        totalOwnGoals: acc.totalOwnGoals + stat.own_goals,
        totalMatches: acc.totalMatches + 1,
        goalkeeperMatches:
          acc.goalkeeperMatches + (stat.was_goalkeeper ? 1 : 0),
      }),
      {
        totalGoals: 0,
        totalAssists: 0,
        totalOwnGoals: 0,
        totalMatches: 0,
        goalkeeperMatches: 0,
      },
    );
  }, [player]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!player) return [];

    return player.player_stats.map((stat, index) => ({
      name: `Match ${index + 1}`,
      goals: stat.goals,
      assists: stat.assists,
      ownGoals: stat.own_goals,
      matchId: stat.match_id,
    }));
  }, [player]);

  if (loading) return <div className="text-center py-12">Carregando...</div>;
  if (error)
    return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!player)
    return <div className="text-center py-12">Jogador não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-24">
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
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {player.name}
                </h1>
                <p className="text-gray-600">
                  Joined: {format(new Date(player.created_at), "dd MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
            Participated in {player.rounds?.length || 0} rounds
          </div>
        </div>
      </motion.div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Goals"
          value={playerStats?.totalGoals || 0}
          icon={<FaFutbol className="text-green-500" />}
          color="border-green-500"
        />
        <StatCard
          title="Total Assists"
          value={playerStats?.totalAssists || 0}
          icon={<FaMedal className="text-blue-500" />}
          color="border-blue-500"
        />
        <StatCard
          title="Matches Played"
          value={playerStats?.totalMatches || 0}
          icon={<FaFutbol className="text-yellow-500" />}
          color="border-yellow-500"
        />
        <StatCard
          title="Goalkeeper Matches"
          value={playerStats?.goalkeeperMatches || 0}
          icon={<GiGoalKeeper className="text-purple-500" />}
          color="border-purple-500"
        />
        <StatCard
          title="Own Goals"
          value={playerStats?.totalOwnGoals || 0}
          icon={<GoalIcon className="text-red-500" />}
          color="border-red-500"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-t-2xl shadow-md mb-6">
        <div className="flex border-b">
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "stats"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            Performance Stats
          </button>
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "rounds"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("rounds")}
          >
            Rounds ({player.rounds?.length || 0})
          </button>
          <button
            className={`py-4 px-6 font-medium ${
              activeTab === "matches"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("matches")}
          >
            Match Details ({player.player_stats?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl shadow-lg p-6 mb-8">
        {activeTab === "stats" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="goals" name="Goals" fill="#10B981">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10B981" />
                    ))}
                  </Bar>
                  <Bar dataKey="assists" name="Assists" fill="#3B82F6">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3B82F6" />
                    ))}
                  </Bar>
                  <Bar dataKey="ownGoals" name="Own Goals" fill="#EF4444">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#EF4444" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "rounds" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Rounds Participated</h2>
            {player.rounds && player.rounds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {player.rounds.map((round) => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    onClick={handleRoundClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Player hasn't participated in any rounds yet
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Match Statistics</h2>
            {player.player_stats && player.player_stats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {player.player_stats.map((stat) => (
                  <MatchStatCard key={stat.id} stat={stat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No match statistics available for this player
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPage;
