import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import championshipService from "../../../services/championshipService";
import roundService from "../../../services/roundService";
import CreateRoundModal from "../rounds/CreateRoundModal";
import { Championship } from "../../../types";

const ChampionshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const championshipData = await championshipService.getById(id!);
        setChampionship(championshipData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCreateRound = async (formData: {
    name: string;
    round_date: string;
    championship_id: string;
  }) => {
    try {
      const createdRound = await roundService.create(formData);
      setMessage(`Rodada "${createdRound.name}" criada com sucesso!`);
      setOpen(true);

      // Update the rounds list
      const updatedChampionship = await championshipService.getById(id!);
      setChampionship(updatedChampionship);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleCardClick = (roundId: string) => {
    navigate(`/rounds/${roundId}`);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  if (!championship)
    return <div className="text-center py-8">Championship not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      {/* Championship Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {championship.name}
        </h1>
        {championship.description && (
          <p className="text-gray-600 mb-4">{championship.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-semibold">Created:</span>{" "}
            {format(new Date(championship.created_at), "dd/MM/yyyy")}
          </div>
          <div>
            <span className="font-semibold">Last Updated:</span>{" "}
            {format(new Date(championship.updated_at), "dd/MM/yyyy")}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            Total Rounds
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {championship.round_total}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Total Players
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {championship.total_players}
          </p>
        </div>
      </div>

      {/* Rounds Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rodadas</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            Nova Rodada
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {championship.rounds?.map((round) => (
            <motion.div
              key={round.id}
              whileHover={{ scale: 1.02 }}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              onClick={() => handleCardClick(round.id)}
            >
              <h3 className="font-semibold text-lg mb-2">{round.name}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(round.round_date), "dd/MM/yyyy")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <CreateRoundModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRound}
        />
      )}

      {/* Players Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {championship.players?.map((player) => (
            <div
              key={player.id}
              className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{player.id}</h3>
                <h3 className="font-medium text-gray-800">{player.name}</h3>
                <p className="text-sm text-gray-500">
                  Participou de {player.rounds?.length} rodadas
                </p>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default ChampionshipPage;
