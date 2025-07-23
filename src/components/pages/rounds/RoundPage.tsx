import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  FaSearch,
  FaFutbol,
  FaUser,
  FaUsers,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";
import roundService from "../../../services/roundService";
import matchService from "../../../services/matchService";
import playerService from "../../../services/playerService";
import teamService from "../../../services/teamService";
import { Round } from "../../../types";
import CreateMatchModal from "../matches/CreateMatchModal";
import CreatePlayerModal from "../players/CreatePlayerModal";
import CreateTeamModal from "../teams/CreateTeamModal";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

type ServiceType<T> = {
  create: (data: T) => Promise<{ id: string; name: string }>;
};

const Section = ({ title, icon, addLabel, onAdd, children }) => (
  <section className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
      >
        <FaPlus />
        {addLabel}
      </button>
    </div>
    {children}
  </section>
);

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const RoundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [modals, setModals] = useState({
    match: false,
    player: false,
    team: false,
  });

  const debouncedPlayerSearch = useDebounce(playerSearch, 300);
  const debouncedTeamSearch = useDebounce(teamSearch, 300);

  const filteredPlayers = useMemo(
    () =>
      round?.players?.filter((p) =>
        p.name.toLowerCase().includes(debouncedPlayerSearch.toLowerCase()),
      ) || [],
    [round, debouncedPlayerSearch],
  );

  const filteredTeams = useMemo(
    () =>
      round?.teams?.filter((t) =>
        t.name.toLowerCase().includes(debouncedTeamSearch.toLowerCase()),
      ) || [],
    [round, debouncedTeamSearch],
  );

  const fetchRoundData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const roundData = await roundService.getById(id!, signal && { signal });
        if (!roundData.matches || !roundData.players)
          throw new Error("Invalid round data structure");
        setRound(roundData);
        setError(null);
      } catch (err) {
        if (!signal?.aborted) {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchRoundData(abortController.signal);
    return () => abortController.abort();
  }, [fetchRoundData]);

  const useCreateHandler = <T extends { name: string }>(
    service: ServiceType<T>,
    successMessage: string,
    fetchRoundData: () => Promise<void>,
  ) => {
    return useCallback(
      async (formData: T) => {
        try {
          const created = await service.create(formData);
          setMessage(`${successMessage} "${created.name}" criado com sucesso!`);
          setOpen(true);
          await fetchRoundData();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      },
      [service, successMessage, fetchRoundData],
    );
  };

  const handleCreateMatch = useCreateHandler(
    matchService,
    "Partida",
    fetchRoundData,
  );

  const handleCreatePlayer = useCreateHandler(
    playerService,
    "Jogador",
    fetchRoundData,
  );

  const handleCreateTeam = useCreateHandler(
    teamService,
    "Time",
    fetchRoundData,
  );

  const handleMatchCardClick = useCallback(
    (matchId: string) => {
      navigate(`/matches/${matchId}`);
    },
    [navigate],
  );

  const handlePlayerCardClick = useCallback(
    (playerId: string) => {
      navigate(`/players/${playerId}`);
    },
    [navigate],
  );

  const handleTeamCardClick = useCallback(
    (teamId: string) => {
      navigate(`/teams/${teamId}`, {
        state: { roundId: id },
      });
    },
    [navigate, id],
  );

  const handleBackClick = useCallback(() => navigate(-1), [navigate]);

  const handleClose = useCallback(
    (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") return;
      setOpen(false);
    },
    [],
  );

  const currentPlayers = useMemo(() => round?.players || [], [round?.players]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-12">Error: {error}</div>;
  if (!round) return <div className="text-center py-12">Round not found</div>;

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
              <FaArrowLeft /> Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {round.name}
            </h1>
            <p className="text-gray-600">
              {format(new Date(round.round_date), "dd MMMM yyyy")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            {round.matches?.length} Partidas
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Section
          title="Partidas"
          icon={<FaFutbol className="text-green-500" />}
          addLabel="Criar Partida"
          onAdd={() => setModals((prev) => ({ ...prev, match: true }))}
        >
          <CreateMatchModal
            isOpen={modals.match}
            onClose={() => setModals((prev) => ({ ...prev, match: false }))}
            onCreate={handleCreateMatch}
            teams={round.teams}
          />

          <div className="space-y-4">
            {round.matches?.map((match) => (
              <MatchItem
                key={match.id}
                match={match}
                onClick={handleMatchCardClick}
              />
            ))}
            {!round.matches?.length && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma partida cadastrada nesta rodada
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Jogadores"
          icon={<FaUser className="text-blue-500" />}
          addLabel="Criar Jogador"
          onAdd={() => setModals((prev) => ({ ...prev, player: true }))}
        >
          <CreatePlayerModal
            isOpen={modals.player}
            onClose={() => setModals((prev) => ({ ...prev, player: false }))}
            onCreate={handleCreatePlayer}
            championshipId={round?.championship_id}
            currentPlayers={currentPlayers}
          />

          <SearchInput
            value={playerSearch}
            onChange={setPlayerSearch}
            placeholder="Buscar jogador..."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlayers.map((player) => (
              <PlayerItem
                key={player.id}
                player={player}
                onClick={handlePlayerCardClick}
              />
            ))}
            {!filteredPlayers.length && (
              <EmptyState message="Nenhum jogador encontrado" />
            )}
          </div>
        </Section>

        <Section
          title="Times"
          icon={<FaUsers className="text-blue-500" />}
          addLabel="Criar Time"
          onAdd={() => setModals((prev) => ({ ...prev, team: true }))}
        >
          <CreateTeamModal
            isOpen={modals.team}
            onClose={() => setModals((prev) => ({ ...prev, team: false }))}
            onCreate={handleCreateTeam}
            roundId={id}
          />

          <SearchInput
            value={teamSearch}
            onChange={setTeamSearch}
            placeholder="Buscar time..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((team) => (
              <TeamItem
                key={team.id}
                team={team}
                onClick={handleTeamCardClick}
              />
            ))}
            {!filteredTeams.length && (
              <EmptyState message="Nenhum time encontrado" />
            )}
          </div>
        </Section>

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
    </div>
  );
};

const MatchItem = React.memo(({ match, onClick }) => (
  <motion.div
    variants={itemVariants}
    onClick={() => onClick(match.id)}
    className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500">
        {format(new Date(match.created_at), "dd/MM/yyyy")}
      </span>
      <span className="text-sm text-gray-500">{match.name}</span>
      <span
        className={`px-2 py-1 rounded-full text-sm ${match.winning_team ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
      >
        {match.winning_team ? "Finalizado" : "Agendado"}
      </span>
    </div>
    <div className="grid grid-cols-3 items-center text-center gap-4">
      <p className="font-medium text-right">{match.team_1.name}</p>
      <div className="text-2xl font-bold text-gray-500">
        <span className="font-medium">{match.team_1_goals}</span>x
        <span className="font-medium">{match.team_2_goals}</span>
      </div>
      <p className="font-medium text-left">{match.team_2.name}</p>
    </div>
  </motion.div>
));

const PlayerItem = React.memo(({ player, onClick }) => (
  <motion.div
    variants={itemVariants}
    onClick={() => onClick(player.id)}
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
          Participou de {player.rounds?.length} rodadas
        </p>
      </div>
    </div>
  </motion.div>
));

const TeamItem = React.memo(({ team, onClick }) => (
  <motion.div
    variants={itemVariants}
    onClick={() => onClick(team.id)}
    className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 font-bold">
          {team.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <h3 className="font-semibold">{team.name}</h3>
    </div>
  </motion.div>
));

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

const EmptyState = ({ message }) => (
  <div className="col-span-full text-center py-8 text-gray-500">{message}</div>
);

export default RoundPage;
