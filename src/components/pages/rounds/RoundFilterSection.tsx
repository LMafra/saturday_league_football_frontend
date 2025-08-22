import React from "react";
import { FiFilter } from "react-icons/fi";
import { format } from "date-fns";
import { Player, Round } from "../../../types";

interface RoundFilterSectionProps {
  context: "round" | "team";
  rounds: Round[];
  showRoundFilter: boolean;
  selectedRoundid: number | null;
  onToggleFilter: () => void;
  onRoundChange: (roundId: number) => void;
  existingPlayers: Player[];
}

export const RoundFilterSection: React.FC<RoundFilterSectionProps> = ({
  context,
  rounds,
  showRoundFilter,
  selectedRoundId,
  onToggleFilter,
  onRoundChange,
  existingPlayers,
}) => {
  if (context !== "round" || rounds.length === 0) return null;

  return (
    <div className="px-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium text-sm">Filter by Round:</label>
        <button
          onClick={onToggleFilter}
          className="text-blue-600 flex items-center gap-1 text-sm"
        >
          <FiFilter /> {showRoundFilter ? "Hide" : "Show"}
        </button>
      </div>

      {showRoundFilter && (
        <div className="mb-4">
          <select
            value={selectedRoundId || ""}
            onChange={(e) => onRoundChange(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          >
            {rounds.map((round) => (
              <option key={round.id} value={round.id}>
                {round.name} ({format(new Date(round.round_date), "dd/MM/yyyy")}
                )
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Showing {existingPlayers.length} players from this round
          </p>
        </div>
      )}
    </div>
  );
};
