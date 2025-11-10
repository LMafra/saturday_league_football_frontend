import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { BaseModal } from "../../modal/BaseModal";
import { RoundFilterSection } from "../rounds/RoundFilterSection";
import { Player, Round, Team } from "../../../types";
import playerService from "../../../services/playerService";
import PlayerSearchInput from "./PlayerSearchInput";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: {
    name: string;
    player_rounds_attributes?: Array<{ round_id: number }>;
    team_id?: string;
  }) => Promise<void>;
  championshipId?: string;
  currentPlayers: Player[];
  context?: "round" | "team";
  rounds?: Round[];
  playersFromRound?: Player[];
  selectedRoundId?: number | null;
  onRoundChange?: (roundId: number) => void;
  onSuccess?: (payload?: Round | Team) => void;
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
  onSuccess,
}) => {
  const { id: routeIdParam } = useParams<{ id: string }>();
  const routeId = routeIdParam ? Number(routeIdParam) : undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoundFilter, setShowRoundFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // Use ref to cache currentPlayers
  const currentPlayersRef = useRef(currentPlayers);
  currentPlayersRef.current = currentPlayers;

  // Determine the target ID based on context
  const targetId = context === "team" ? routeId : selectedRoundId || routeId;

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setSearchTerm("");
    setSelectedPlayer(null);
    setError(null);
    onClose();
  }, [onClose]);

  // Compute filtered players without useEffect
  const filteredPlayers = React.useMemo(() => {
    if (!isOpen) return [];

    let availablePlayers: Player[] = [];

    if (context === "team" && selectedRoundId && playersFromRound.length > 0) {
      availablePlayers = [...playersFromRound];
    } else if (championshipId) {
      availablePlayers = [...existingPlayers];
    }

    return availablePlayers.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [
    isOpen,
    searchTerm,
    context,
    selectedRoundId,
    playersFromRound,
    championshipId,
    existingPlayers,
  ]);

  // Fetch existing players only when modal opens
  useEffect(() => {
    if (!isOpen || !championshipId) return;

    const fetchPlayers = async () => {
      try {
        setIsLoadingPlayers(true);
        const players = await playerService.getAll(Number(championshipId));

        // Use ref instead of direct dependency
        const availablePlayers = (players as Player[]).filter(
          (player: Player) =>
            !currentPlayersRef.current.some((p) => p.id === player.id),
        );

        setExistingPlayers(availablePlayers);
      } catch {
        setError("Failed to load players");
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [isOpen, championshipId]); // Removed currentPlayers dependency

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedPlayer(null);
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedPlayer) {
        let response: Round | Team | undefined;
        if (context === "round") {
          if (!targetId) throw new Error("Rodada inválida para adicionar jogador.");
          response = await playerService.addToRound(selectedPlayer.id, targetId);
        } else if (context === "team") {
          if (!targetId) throw new Error("Time inválido para adicionar jogador.");
          response = await playerService.addToTeam(selectedPlayer.id, targetId);
        }
        if (response) {
          onSuccess?.(response);
        }
      } else {
        const createData: {
          name: string;
          player_rounds_attributes?: Array<{ round_id: number }>;
          team_id?: string;
        } = { name: searchTerm };

        if (context === "round") {
          createData.player_rounds_attributes = targetId
            ? [{ round_id: targetId }]
            : [];
        } else if (context === "team") {
          createData.team_id = String(targetId);
        }

        await onCreate(createData);
        onSuccess?.();
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPlayer, searchTerm, context, targetId, onCreate, onSuccess, handleClose]);

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
            isLoading={isLoadingPlayers}
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
