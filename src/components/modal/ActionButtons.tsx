import React from "react";
import { Player } from "../../types";

interface ActionButtonsProps {
  isSubmitting: boolean;
  searchTerm: string;
  selectedPlayer: Player | null;
  context: "round" | "team";
  onClose: () => void;
  onSubmit: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSubmitting,
  searchTerm,
  selectedPlayer,
  context,
  onClose,
  onSubmit,
}) => (
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
      type="button"
      onClick={onSubmit}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      disabled={isSubmitting || !searchTerm}
    >
      {isSubmitting
        ? selectedPlayer
          ? "Adding..."
          : "Creating..."
        : selectedPlayer
          ? `Add to ${context === "team" ? "Team" : "Round"}`
          : "Create Player"}
    </button>
  </div>
);
