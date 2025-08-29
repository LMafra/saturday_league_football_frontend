import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { FaFutbol, FaEye, FaArrowLeft, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import matchService from "../../../services/matchService";
import playerStatsService from "../../../services/playerStatsService";
import { Match, Player, PlayerStat } from "../../../types";
import EditMatchModal from "./EditMatchModal";

// ===== BEHAVIORAL PATTERN: Strategy Pattern =====
// Different strategies for rendering match statistics
interface StatRendererStrategy {
  render(stats: Record<string, number> | undefined | null, title: string): React.ReactNode;
}

class GoalRendererStrategy implements StatRendererStrategy {
  render(stats: Record<string, number> | undefined | null, title: string): React.ReactNode {
    if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
          <p className="text-gray-400 text-sm">Nenhum gol registrado</p>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
        {Object.entries(stats).map(([playerName, goals], index) => (
          <motion.div
            key={`${playerName}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <FaFutbol className="text-green-500" />
            <span>{playerName}</span>
            {goals > 0 && <span className="text-sm text-gray-500">({goals})</span>}
          </motion.div>
        ))}
      </div>
    );
  }
}

class OwnGoalRendererStrategy implements StatRendererStrategy {
  render(stats: Record<string, number> | undefined | null, title: string): React.ReactNode {
    if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
          <p className="text-gray-400 text-sm">Nenhum gol contra registrado</p>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
        {Object.entries(stats).map(([playerName, goals], index) => (
          <motion.div
            key={`${playerName}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <FaFutbol className="text-red-500" />
            <span className="text-red-600">{playerName}</span>
            {goals > 0 && <span className="text-sm text-gray-500">({goals})</span>}
          </motion.div>
        ))}
      </div>
    );
  }
}

class AssistRendererStrategy implements StatRendererStrategy {
  render(stats: Record<string, number> | undefined | null, title: string): React.ReactNode {
    if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
          <p className="text-gray-400 text-sm">Nenhuma assistência registrada</p>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">{title}</h4>
        {Object.entries(stats).map(([playerName, count], index) => (
          <motion.div
            key={`${playerName}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <FaEye className="text-blue-500" />
            <span>{playerName}</span>
            {count > 0 && <span className="text-sm text-gray-500">({count})</span>}
          </motion.div>
        ))}
      </div>
    );
  }
}

// ===== CREATIONAL PATTERN: Factory Pattern =====
class StatRendererFactory {
  private static strategies: Map<string, StatRendererStrategy> = new Map([
    ['goal', new GoalRendererStrategy()],
    ['ownGoal', new OwnGoalRendererStrategy()],
    ['assist', new AssistRendererStrategy()]
  ]);

  static getRenderer(type: 'goal' | 'ownGoal' | 'assist'): StatRendererStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown renderer type: ${type}`);
    }
    return strategy;
  }
}

// ===== STRUCTURAL PATTERN: Adapter Pattern =====
// Adapter to convert match data to a standardized format
class MatchDataAdapter {
  static adaptTeamStats(match: Match, teamSide: 'team_1' | 'team_2') {
    const opponentSide = teamSide === 'team_1' ? 'team_2' : 'team_1';

    return {
      team: match[teamSide],
      players: match[`${teamSide}_players`],
      goals: match[`${teamSide}_goals`],
      goalsScorer: match[`${teamSide}_goals_scorer`] as unknown as Record<string, number>,
      assists: match[`${teamSide}_assists`] as unknown as Record<string, number>,
      ownGoalsScorer: match[`${opponentSide}_own_goals_scorer`] as unknown as Record<string, number>
    };
  }
}

// ===== COMPONENT FACTORY =====
class ComponentFactory {
  static createPlayerAvatar(player: Player, isLeft: boolean) {
    return (
      <div className={`w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ${!isLeft ? 'order-first' : 'order-last'}`}>
        <span className="text-blue-600 text-sm">
          {player.name[0].toUpperCase()}
        </span>
      </div>
    );
  }

  static createPlayerRow(player: Player, index: number, isLeft: boolean) {
    return (
      <motion.div
        key={player.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-2 mb-2"
      >
        {!isLeft && this.createPlayerAvatar(player, isLeft)}
        <span className="text-gray-700">{player.name}</span>
        {isLeft && this.createPlayerAvatar(player, isLeft)}
      </motion.div>
    );
  }
}

// ===== MAIN COMPONENT =====
const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchIdNum = id ? Number(id) : NaN;
        const matchData = await matchService.getById(matchIdNum);
        if (!matchData?.team_1 || !matchData?.team_2) {
          throw new Error("Invalid match data structure");
        }
        setMatch(matchData);

        // Fetch player stats for this match
        await fetchPlayerStats(matchIdNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMatchData();
  }, [id]);

  const fetchPlayerStats = async (matchId: number) => {
    try {
      const stats = await playerStatsService.getByMatchId(matchId);
      setPlayerStats(stats);
    } catch (err) {
      console.error("Error fetching player stats:", err);
      setPlayerStats([]);
    }
  };

  const handleEditMatch = () => {
    setIsEditModalOpen(true);
  };

  const handleSavePlayerStats = async (playerStatsData: Array<{
    player_id: number;
    team_id: number;
    goals: number;
    own_goals: number;
    assists: number;
    was_goalkeeper: boolean;
  }>) => {
    if (!id) return;

    const statsWithMatchId = playerStatsData.map(stat => ({
      ...stat,
      match_id: Number(id)
    }));

    await playerStatsService.bulkUpdate(Number(id), statsWithMatchId);
    await fetchPlayerStats(Number(id));
    // Refresh match data to get updated statistics
    const matchData = await matchService.getById(Number(id));
    setMatch(matchData);
  };

  const handleBackClick = () => navigate(-1);

  const renderTeamSection = (
    teamStats: ReturnType<typeof MatchDataAdapter.adaptTeamStats>,
    isLeft = true,
  ) => {
    const goalRenderer = StatRendererFactory.getRenderer('goal');
    const ownGoalRenderer = StatRendererFactory.getRenderer('ownGoal');
    const assistRenderer = StatRendererFactory.getRenderer('assist');

    return (
      <div className={`space-y-4 ${isLeft ? "text-right" : "text-left"}`}>
        <h3 className="text-xl font-semibold text-gray-800">{teamStats.team.name}</h3>
        <div className="text-4xl font-bold text-gray-900">
          {teamStats.goals}
        </div>

        <div className="border-t pt-4">
          {goalRenderer.render(teamStats.goalsScorer, "Gols Marcados")}
          {assistRenderer.render(teamStats.assists, "Assistências")}
          {ownGoalRenderer.render(teamStats.ownGoalsScorer, "Gols Contra")}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Jogadores</h4>
          {Array.isArray(teamStats.players) && teamStats.players?.map((player: Player, index: number) =>
            ComponentFactory.createPlayerRow(player, index, isLeft)
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-12">Carregando...</div>;
  if (error)
    return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!match)
    return <div className="text-center py-12">Partida não encontrada</div>;

  const team1Stats = MatchDataAdapter.adaptTeamStats(match, 'team_1');
  const team2Stats = MatchDataAdapter.adaptTeamStats(match, 'team_2');

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {match.name}
            </h1>
            <p className="text-gray-600">
              {format(new Date(match.created_at), "dd MMMM yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={handleEditMatch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit />
              Editar Estatísticas
            </button>
          </div>
        </div>
      </motion.div>

      <section className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Team 1 Section */}
          <div className="md:border-r md:pr-8">
            {renderTeamSection(team1Stats, true)}
          </div>

          {/* Center Divider */}
          <div className="hidden md:flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-400 mx-4">x</div>
          </div>

          {/* Team 2 Section */}
          <div className="md:border-l md:pl-8">
            {renderTeamSection(team2Stats, false)}
          </div>
        </div>
      </section>

      {/* Edit Match Modal */}
      {match && (
        <EditMatchModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSavePlayerStats}
          team1={match.team_1}
          team2={match.team_2}
          team1Players={match.team_1_players || []}
          team2Players={match.team_2_players || []}
          existingStats={playerStats}
        />
      )}
    </div>
  );
};

export default MatchPage;
