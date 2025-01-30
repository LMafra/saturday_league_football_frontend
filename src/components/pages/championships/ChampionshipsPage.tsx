import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrophy } from "react-icons/fa";
import { motion } from "framer-motion";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import championshipService from "../../../services/championshipService";
import CreateChampionshipModal from "./CreateChampionshipModal";
import { Championship } from "../../../types";

const ChampionshipsPage: React.FC = () => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const data = await championshipService.getAll();
        setChampionships(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchChampionships();
  }, []);

  const handleCreateChampionship = async (formData: { name: string }) => {
    try {
      const createdChampionship = await championshipService.create(formData);
      setMessage(`Pelada "${createdChampionship.name}" criada com sucesso!`);
      setOpen(true);

      const data = await championshipService.getAll();
      setChampionships(data);
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

  const handleCardClick = (championshipId: string) => {
    navigate(`/championships/${championshipId}`);
  };

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Peladas Cadastradas
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            Nova Pelada
          </button>
        </div>

        {championships.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">
              Nenhuma pelada cadastrada ainda
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {championships.map((championship) => (
              <motion.div
                key={championship.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCardClick(championship.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {championship.name}
                    </h3>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {championship.round_total} rodadas
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      {championship.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isModalOpen && (
          <CreateChampionshipModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateChampionship}
          />
        )}

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

export default ChampionshipsPage;
