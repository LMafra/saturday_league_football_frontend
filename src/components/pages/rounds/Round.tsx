import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { FaSearch, FaFutbol, FaUsers, FaShirtsinbulk } from 'react-icons/fa';
import { motion } from 'framer-motion';
import roundService from '../../../services/roundService';

interface Team {
  id: string;
  name: string;
}

interface Match {
  id: string;
  name: string;
  team_1: Team;
  team_2: Team;
  team_1_goals: number;
  team_2_goals: number;
  winning_team: string | null;
  draw: boolean;
  created_at: string;
}

interface Player {
  id: string;
  name: string;
  rounds: Array<{
    id: string;
    name: string;
  }>;
}

interface RoundData {
  id: string;
  name: string;
  round_date: string;
  championship_id: string;
  created_at: string;
  updated_at: string;
  matches: Match[];
  players: Player[];
}

const Round: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [round, setRound] = useState<RoundData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        const roundData = await roundService.getById(id!);

        if (!roundData.matches || !roundData.players) {
          throw new Error('Invalid round data structure');
        }

        setRound(roundData);
      } catch (err) {
        setError(err.message || 'Failed to load round data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoundData();
  }, [id]);

  const filteredPlayers = round?.players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-12">Error: {error}</div>;
  if (!round) return <div className="text-center py-12">Round not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-24">
      {/* Round Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{round.name}</h1>
            <p className="text-gray-600">
              {format(new Date(round.round_date), "dd MMMM yyyy")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            {round.matches.length} Partidas
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Matches Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FaFutbol className="text-green-500" />
              Partidas
            </h2>
          </div>

          <div className="space-y-4">
            {round.matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {format(new Date(match.created_at), 'dd/MM/yyyy')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    match.winning_team ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {match.winning_team ? 'Finalizado' : 'Agendado'}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center text-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{match.team_1.name}</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-500">
                    <span className="font-medium">{match.team_1_goals}</span>
                    <span>x</span>
                    <span className="font-medium">{match.team_2_goals}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{match.team_2.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {round.matches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma partida cadastrada nesta rodada
              </div>
            )}
          </div>
        </section>

        {/* Players Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FaUsers className="text-blue-500" />
              Jogadores
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar jogador..."
                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlayers.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
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
                      Participou de {player.rounds.length} rodadas
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredPlayers.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Nenhum jogador encontrado
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Round;
