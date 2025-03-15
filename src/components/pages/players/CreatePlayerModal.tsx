import React, { useState, useEffect, useMemo, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FaUser, FaUserPlus } from "react-icons/fa";
import playerService from "../../../services/playerService";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";

interface Player {
  id: string;
  name: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: {
    name: string;
    player_rounds_attributes: Array<{ round_id: string }>
  }) => Promise<void>;
  championshipId?: string;
  currentPlayers: Player[];
}

const CreatePlayerModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  championshipId,
  currentPlayers,
}) => {
  const { id: roundId } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const currentPlayerIds = useMemo(() =>
    new Set(currentPlayers.map(p => p.id)),
  [currentPlayers]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (championshipId) {
        try {
          const players = await playerService.getAll(championshipId);
          const availablePlayers = players.filter(
            player => !currentPlayerIds.has(player.id)
          );
          setExistingPlayers(availablePlayers);
        } catch (err) {
          setError("Failed to load existing players");
        }
      }
    };

    if (isOpen) fetchPlayers();
  }, [championshipId, isOpen, currentPlayerIds]);

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return [];
    return existingPlayers.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentPlayerIds.has(player.id)
    );
  }, [existingPlayers, searchTerm, currentPlayerIds]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedPlayer(null);
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
  };

  const handleClose = useCallback(
    (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") return;
      setOpen(false);
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedPlayer) {
        await playerService.addToRound(selectedPlayer.id, roundId!);
        setMessage(`${selectedPlayer.name} added to round!`);
      } else {
        await onCreate({
          name: searchTerm,
          player_rounds_attributes: roundId ? [{ round_id: roundId }] : []
        });
        setMessage(`${searchTerm} created successfully!`);
      }

      setOpen(true);
      onClose();
      setSearchTerm("");
      setSelectedPlayer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedPlayer ? "Add Player" : "Create Player"}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedPlayer ? "Selected Player" : "Search Players"}
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                        placeholder="Type to search or create..."
                        disabled={!!selectedPlayer}
                      />
                      <FiSearch className="absolute right-4 top-3.5 text-gray-400" />
                    </div>

                    {!selectedPlayer && searchTerm && (
                      <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredPlayers.map(player => (
                          <button
                            type="button"
                            key={player.id}
                            onClick={() => handleSelectPlayer(player)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3"
                          >
                            <FaUser className="text-blue-600" />
                            <span>{player.name}</span>
                          </button>
                        ))}

                        {filteredPlayers.length === 0 && (
                          <button
                            type="submit"
                            className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center gap-3 text-green-600"
                          >
                            <FaUserPlus className="text-green-600" />
                            <span>Create new: {searchTerm}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={isSubmitting || !searchTerm}
                >
                  {isSubmitting
                    ? selectedPlayer ? "Adding..." : "Creating..."
                    : selectedPlayer ? "Add Player" : "Create Player"}
                </button>
              </div>
            </form>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePlayerModal;

