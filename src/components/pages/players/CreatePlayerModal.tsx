// CreatePlayerModal.tsx
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { ModalHeader } from "../../modal/ModalHeader";
import { RoundFilterSection } from "../rounds/RoundFilterSection";
import { PlayerSearchInput } from "./PlayerSearchInput";
import { ActionButtons } from "../../modal/ActionButtons";
import { usePlayerModalLogic } from "../../../hooks/usePlayerModalLogic";
import { Player, Round } from "../../../types";
import playerService from "../../../services/playerService";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: {
    name: string;
    player_rounds_attributes?: Array<{ round_id: string }>;
    team_id?: string;
  }) => Promise<void>;
  championshipId?: string;
  currentPlayers: Player[];
  context?: "round" | "team";
  rounds?: Round[];
  playersFromRound?: Player[];
  selectedRoundId?: string | null;
  onRoundChange?: (roundId: string) => void;
}

const CreatePlayerModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  championshipId,
  currentPlayers,
  context = "round",
  rounds = [],
  playersFromRound = [],
  selectedRoundId = null,
  onRoundChange = () => {}
}) => {
  const { id: routeId } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showRoundFilter, setShowRoundFilter] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    existingPlayers,
    filteredPlayers,
    selectedPlayer,
    setSelectedPlayer,
    error,
    setError,
    handleSearchChange,
    handleSelectPlayer
  } = usePlayerModalLogic(
    isOpen,
    championshipId,
    currentPlayers,
    context,
    playersFromRound,
  );

  // Determine target ID based on context
  const targetId = context === "team"
    ? routeId
    : selectedRoundId || routeId;

  const handleCloseSnackbar = useCallback(
    (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
      if (reason === "clickaway") return;
      setOpenSnackbar(false);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedPlayer) {
        if (context === "round") {
          await playerService.addToRound(selectedPlayer.id, targetId!);
          setMessage(`${selectedPlayer.name} added to round!`);
        } else if (context === "team") {
          await playerService.addToTeam(selectedPlayer.id, targetId!);
          setMessage(`${selectedPlayer.name} added to team!`);
        }
      } else {
        const createData: {
          name: string;
          player_rounds_attributes?: Array<{ round_id: string }>;
          team_id?: string;
        } = { name: searchTerm };

        if (context === "round") {
          createData.player_rounds_attributes = targetId ? [{ round_id: targetId }] : [];
        } else if (context === "team") {
          createData.team_id = targetId;
        }

        await onCreate(createData);
        setMessage(`${searchTerm} created successfully!`);
      }

      setOpenSnackbar(true);
      onClose();
      setSearchTerm("");
      setSelectedPlayer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlayer, searchTerm, context, targetId, onCreate, onClose]);

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
            <ModalHeader
              context={context}
              selectedPlayer={selectedPlayer}
              onClose={onClose}
            />

            <RoundFilterSection
              context={context}
              rounds={rounds}
              showRoundFilter={showRoundFilter}
              selectedRoundId={selectedRoundId}
              onToggleFilter={() => setShowRoundFilter(!showRoundFilter)}
              onRoundChange={onRoundChange}
              existingPlayers={existingPlayers}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="p-6"
            >
              <div className="space-y-6">
                <PlayerSearchInput
                  searchTerm={searchTerm}
                  selectedPlayer={selectedPlayer}
                  context={context}
                  filteredPlayers={filteredPlayers}
                  onSearchChange={handleSearchChange}
                  onSelectPlayer={handleSelectPlayer}
                  onSubmit={handleSubmit}
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}
              </div>

              <ActionButtons
                isSubmitting={isSubmitting}
                searchTerm={searchTerm}
                selectedPlayer={selectedPlayer}
                context={context}
                onClose={onClose}
                onSubmit={handleSubmit}
              />
            </form>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
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
