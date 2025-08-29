import React from "react";
import { Player } from "../../../types";
import { FaSearch } from "react-icons/fa";

interface PlayerSearchInputProps {
  searchTerm: string;
  selectedPlayer: Player | null;
  context: "round" | "team";
  filteredPlayers: Player[];
  onSearchChange: (value: string) => void;
  onSelectPlayer: (player: Player) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const PlayerSearchInput: React.FC<PlayerSearchInputProps> = ({
  searchTerm,
  selectedPlayer,
  context,
  filteredPlayers,
  onSearchChange,
  onSelectPlayer,
  onSubmit,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder={
            selectedPlayer
              ? `Add ${selectedPlayer.name} to ${context === "team" ? "team" : "round"}`
              : "Search players or create a new one"
          }
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

        {isLoading && (
          <div className="absolute right-3 top-3.5">
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        )}
      </div>

      {!selectedPlayer && searchTerm && (
        <div className="bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                onClick={() => onSelectPlayer(player)}
              >
                {player.name}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500">
              {isLoading ? "Loading players..." : "No players found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerSearchInput;
