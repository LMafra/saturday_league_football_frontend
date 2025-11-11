import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Snackbar from "@mui/material/Snackbar";
import { SnackbarCloseReason } from "@mui/material/Snackbar";
import { motion } from "framer-motion";
import { FaPlus, FaTrophy } from "react-icons/fa";
import championshipRepository from "@/features/championships/api/championshipRepository";
import CreateChampionshipModal from "@/features/championships/components/CreateChampionshipModal";
import Container from "@/shared/components/layout/Container";
import { typography } from "@/shared/styles/tokens";
import { Championship } from "@/types";

const queryKeys = {
  championships: ["championships"] as const,
};

const ChampionshipListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string | null }>({
    open: false,
    message: null,
  });

  const { data: championships, isLoading, error } = useQuery({
    queryKey: queryKeys.championships,
    queryFn: () => championshipRepository.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      championshipRepository.createChampionship(payload),
    onSuccess: (created) => {
      setToast({
        open: true,
        message: `Pelada "${created.name}" criada com sucesso!`,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.championships });
      setIsModalOpen(false);
    },
    onError: (mutationError) => {
      setToast({
        open: true,
        message:
          mutationError instanceof Error
            ? mutationError.message
            : "Não foi possível criar a pelada.",
      });
    },
  });

  const handleCloseToast = (_event: Event | React.SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") return;
    setToast({ open: false, message: null });
  };

  const handleCardClick = (championshipId: number) => {
    navigate(`/championships/${championshipId}`);
  };

  if (isLoading) {
    return <div className="mt-24 flex min-h-screen items-center justify-center">Carregando peladas...</div>;
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
    return (
      <div className="mt-24 flex min-h-screen items-center justify-center">
        <span className="rounded-lg bg-red-50 px-4 py-3 text-red-600">{message}</span>
      </div>
    );
  }

  return (
    <div
      className="mt-24 min-h-screen bg-gray-50 py-8"
      style={{ fontFamily: typography.fontFamily }}
    >
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <FaTrophy className="text-yellow-500" aria-hidden />
            Peladas Cadastradas
          </h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <FaPlus aria-hidden />
            Nova Pelada
          </button>
        </div>
        {championships && championships.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {championships.map((championship: Championship) => (
              <motion.button
                key={championship.id}
                type="button"
                onClick={() => handleCardClick(championship.id)}
                whileHover={{ scale: 1.02 }}
                className="h-full rounded-xl bg-white p-6 text-left shadow-md transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{championship.name}</h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {championship.round_total} rodadas
                  </span>
                </div>
                {championship.description && (
                  <p className="mt-4 text-sm text-gray-600">{championship.description}</p>
                )}
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                  <span>{championship.total_players} jogadores</span>
                  <span>ID #{championship.id}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <div className="rounded-lg bg-white py-12 text-center text-gray-500 shadow-sm">
            Nenhuma pelada cadastrada ainda.
          </div>
        )}
      </Container>
      {isModalOpen && (
        <CreateChampionshipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
        />
      )}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        message={toast.message}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: toast.message?.includes("sucesso") ? "#2563eb" : "#b91c1c",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default ChampionshipListPage;

