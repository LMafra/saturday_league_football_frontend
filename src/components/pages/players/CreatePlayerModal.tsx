// CreatePlayerModal.tsx
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { BaseModal } from "../../modal/BaseModal";
import { RoundFilterSection } from "../rounds/RoundFilterSection";
import { PlayerSearchInput } from "./PlayerSearchInput";
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
  onRoundChange = () => {},
}) => {
  const { id: routeId } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showRoundFilter, setShowRoundFilter] = React.useState(false);

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
    handleSelectPlayer,
  } = usePlayerModalLogic(
    isOpen,
    championshipId,
    currentPlayers,
    context,
    playersFromRound,
  );

  const targetId = context === "team" ? routeId : selectedRoundId || routeId;

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setSelectedPlayer(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedPlayer) {
        if (context === "round") {
          await playerService.addToRound(selectedPlayer.id, targetId!);
        } else if (context === "team") {
          await playerService.addToTeam(selectedPlayer.id, targetId!);
        }
      } else {
        const createData: {
          name: string;
          player_rounds_attributes?: Array<{ round_id: string }>;
          team_id?: string;
        } = { name: searchTerm };

        if (context === "round") {
          createData.player_rounds_attributes = targetId
            ? [{ round_id: targetId }]
            : [];
        } else if (context === "team") {
          createData.team_id = targetId;
        }

        await onCreate(createData);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlayer, searchTerm, context, targetId, onCreate, handleClose]);

  const title = selectedPlayer
    ? `Add Player to ${context === "team" ? "Team" : "Round"}`
    : `Create Player for ${context === "team" ? "Team" : "Round"}`;

  const submitLabel = isSubmitting
    ? selectedPlayer
      ? "Adding..."
      : "Creating..."
    : selectedPlayer
      ? `Add to ${context === "team" ? "Team" : "Round"}`
      : "Create Player";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      formId="player-form"
      isSubmitting={isSubmitting}
      submitDisabled={isSubmitting || !searchTerm}
      submitLabel={submitLabel}
    >
      <form
        id="player-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <RoundFilterSection
          context={context}
          rounds={rounds}
          showRoundFilter={showRoundFilter}
          selectedRoundId={selectedRoundId}
          onToggleFilter={() => setShowRoundFilter(!showRoundFilter)}
          onRoundChange={onRoundChange}
          existingPlayers={existingPlayers}
        />

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
      </form>
    </BaseModal>
  );
};

export default CreatePlayerModal;
