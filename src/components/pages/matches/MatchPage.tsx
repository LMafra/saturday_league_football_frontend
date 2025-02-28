import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { FaFutbol, FaEye, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import matchService from "../../../services/matchService";
import { Match } from "../../../types";

const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchData = await matchService.getById(id!);
        if (!matchData?.team_1 || !matchData?.team_2) {
          throw new Error("Invalid match data structure");
        }
        setMatch(matchData);
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

  const handleBackClick = () => navigate(-1);

  const renderAssists = (assists: Record<string, number>) => {
    if (!assists || !Object.keys(assists).length) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">
          Assistências
        </h4>
        {Object.entries(assists).map(([player, assists], index) => (
          <motion.div
            key={`${player}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="flex gap-1">
              {Array(assists)
                .fill(null)
                .map((_, i) => (
                  <FaEye key={i} />
                ))}
            </div>
            <span>{player}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderScorers = (
    scorers: Record<string, number>,
    isOwnGoal = false,
  ) => {
    if (!scorers || !Object.keys(scorers).length) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">
          {isOwnGoal ? "Gols Contra" : "Gols Marcados"}
        </h4>
        {Object.entries(scorers).map(([player, goals], index) => (
          <motion.div
            key={`${player}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            {!isOwnGoal && (
              <div className="flex gap-1">
                {Array(goals)
                  .fill(null)
                  .map((_, i) => (
                    <FaFutbol
                      key={i}
                      className={`text-${isOwnGoal ? "red" : "green"}-500`}
                    />
                  ))}
              </div>
            )}
            <span className={`font-medium ${isOwnGoal ? "text-red-600" : ""}`}>
              {player}
            </span>
            {isOwnGoal && (
              <div className="flex gap-1">
                {Array(goals)
                  .fill(null)
                  .map((_, i) => (
                    <FaFutbol key={i} className="text-red-500" />
                  ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTeamSection = (
    team: any,
    players: any[],
    goalsScorers: any,
    assists: any,
    opponentOwnGoals: any,
    isLeft = true,
  ) => (
    <div className={`space-y-4 ${isLeft ? "text-right" : "text-left"}`}>
      <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
      <div className="text-4xl font-bold text-gray-900">
        {isLeft ? match?.team_1_goals : match?.team_2_goals}
      </div>

      <div className="border-t pt-4">
        {renderScorers(goalsScorers)}
        {renderAssists(assists)}
        {renderScorers(opponentOwnGoals, true)}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">Jogadores</h4>
        {players?.map((player: any, index: number) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 mb-2"
          >
            {!isLeft && (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm">
                  {player.name[0].toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-gray-700">{player.name}</span>
            {isLeft && (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm">
                  {player.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-12">Carregando...</div>;
  if (error)
    return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!match)
    return <div className="text-center py-12">Partida não encontrada</div>;

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
          <div
            className={`mt-4 md:mt-0 px-4 py-2 rounded-full ${
              match.winning_team
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {match.winning_team ? "Finalizado" : "Agendado"}
          </div>
        </div>
      </motion.div>

      <section className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Team 1 Section */}
          <div className="md:border-r md:pr-8">
            {renderTeamSection(
              match.team_1,
              match.team_1_players,
              match.team_1_goals_scorer,
              match.team_1_assists,
              match.team_2_own_goals_scorer,
              true,
            )}
          </div>

          {/* Center Divider */}
          <div className="hidden md:flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-400 mx-4">x</div>
          </div>

          {/* Team 2 Section */}
          <div className="md:border-l md:pl-8">
            {renderTeamSection(
              match.team_2,
              match.team_2_players,
              match.team_2_goals_scorer,
              match.team_2_assists,
              match.team_1_own_goals_scorer,
              false,
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchPage;
