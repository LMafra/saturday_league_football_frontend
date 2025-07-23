// usePlayerModalLogic.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import playerService from "../services/playerService";
import { Player } from "../types";

export const usePlayerModalLogic = (
  isOpen: boolean,
  championshipId: string | undefined,
  currentPlayers: Player[],
  context: "round" | "team",
  playersFromRound: Player[],
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlayerIds = useMemo(
    () => new Set(currentPlayers.map((p) => p.id)),
    [currentPlayers],
  );

  // Player fetching logic
  useEffect(() => {
    const fetchPlayers = async () => {
      if (championshipId && isOpen) {
        try {
          const players = await playerService.getAll(championshipId);
          const availablePlayers = players.filter(
            (player) => !currentPlayerIds.has(player.id),
          );
          setExistingPlayers(availablePlayers);
        } catch (err) {
          setError("Failed to load existing players");
        }
      }
    };

    // Only fetch if modal is open and we haven't fetched yet
    if (isOpen && existingPlayers.length === 0) {
      fetchPlayers();
    }
  }, [championshipId, isOpen]); // Removed currentPlayerIds dependency

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return [];
    return existingPlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !currentPlayerIds.has(player.id),
    );
  }, [existingPlayers, searchTerm, currentPlayerIds]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setSelectedPlayer(null);
    },
    [],
  );

  const handleSelectPlayer = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
  }, []);

  return {
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
  };
};
