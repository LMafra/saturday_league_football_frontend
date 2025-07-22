// PlayerSearchInput.tsx
import React from "react";
import { FiSearch } from "react-icons/fi";
import { FaUser, FaUserPlus, FaUsers } from "react-icons/fa";
import { Player } from "../../../types";

interface PlayerSearchInputProps {
  searchTerm: string;
  selectedPlayer: Player | null;
  context: "round" | "team";
  filteredPlayers: Player[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPlayer: (player: Player) => void;
  onSubmit: () => void;
}

export const PlayerSearchInput: React.FC<PlayerSearchInputProps> = ({
  searchTerm,
  selectedPlayer,
  context,
  filteredPlayers,
  onSearchChange,
  onSelectPlayer,
  onSubmit
}) => (
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
            onChange={onSearchChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
            placeholder="Type to search or create..."
            disabled={!!selectedPlayer}
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400" />
        </div>

        {!selectedPlayer && searchTerm && (
          <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredPlayers.map((player) => (
              <button
                type="button"
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3"
              >
                {context === "team" ? (
                  <FaUsers className="text-purple-600" />
                ) : (
                  <FaUser className="text-blue-600" />
                )}
                <span>{player.name}</span>
              </button>
            ))}

            {filteredPlayers.length === 0 && (
              <button
                type="button"
                onClick={onSubmit}
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
  </div>
);
