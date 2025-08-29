import React, { useEffect, useState } from "react";
import { BaseModal } from "../../modal/BaseModal";
import { Player, PlayerStat, Team } from "../../../types";

interface PlayerStatForm {
  player_id: number;
  team_id: number;
  goals: number;
  own_goals: number;
  assists: number;
  was_goalkeeper: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerStats: PlayerStatForm[]) => Promise<void>;
  team1: Team;
  team2: Team;
  team1Players: Player[];
  team2Players: Player[];
  existingStats?: PlayerStat[];
}

const EditMatchModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  team1,
  team2,
  team1Players,
  team2Players,
  existingStats = [],
}) => {
  const [playerStats, setPlayerStats] = useState<PlayerStatForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize player stats for all players
  useEffect(() => {
    const allPlayers = [
      ...team1Players.map(player => ({ ...player, team_id: team1.id })),
      ...team2Players.map(player => ({ ...player, team_id: team2.id }))
    ];

    const initialStats = allPlayers.map(player => {
      return {
        player_id: player.id,
        team_id: player.team_id,
        goals: 0,
        own_goals: 0,
        assists: 0,
        was_goalkeeper: false,
      };
    });

    setPlayerStats(initialStats);
  }, [team1Players, team2Players, team1.id, team2.id, existingStats]);

  const updatePlayerStat = (playerId: number, field: keyof PlayerStatForm, value: number | boolean) => {
    setPlayerStats(prev =>
      prev.map(stat =>
        stat.player_id === playerId
          ? { ...stat, [field]: value }
          : stat
      )
    );
  };

  const getPlayerName = (playerId: number) => {
    const player = [...team1Players, ...team2Players].find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  const getPlayerTeam = (playerId: number) => {
    const player = team1Players.find(p => p.id === playerId);
    if (player) return team1;
    return team2;
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      await onSave(playerStats);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  const renderPlayerStatRow = (stat: PlayerStatForm) => {
    const playerName = getPlayerName(stat.player_id);
    const team = getPlayerTeam(stat.player_id);
    const isTeam1 = team.id === team1.id;

    return (
      <div key={stat.player_id} className="border rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isTeam1 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <span className={`text-sm font-bold ${
                isTeam1 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {playerName[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{playerName}</h4>
              <p className="text-sm text-gray-500">{team.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={stat.was_goalkeeper}
                onChange={(e) => updatePlayerStat(stat.player_id, 'was_goalkeeper', e.target.checked)}
                className="rounded"
              />
              Goleiro
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gols
            </label>
            <input
              type="number"
              value={stat.goals}
              onChange={(e) => updatePlayerStat(stat.player_id, 'goals', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gols Contra
            </label>
            <input
              type="number"
              value={stat.own_goals}
              onChange={(e) => updatePlayerStat(stat.player_id, 'own_goals', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assistências
            </label>
            <input
              type="number"
              value={stat.assists}
              onChange={(e) => updatePlayerStat(stat.player_id, 'assists', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Estatísticas da Partida"
      formId="edit-match-form"
      isSubmitting={loading}
      submitDisabled={loading}
      submitLabel="Salvar Estatísticas"
    >
      <form id="edit-match-form" onSubmit={handleSubmit}>
        <div className="max-h-96 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {team1.name} vs {team2.name}
            </h3>

            {playerStats.map(renderPlayerStatRow)}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-6">
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default EditMatchModal;
