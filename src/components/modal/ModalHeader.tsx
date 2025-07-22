// ModalHeader.tsx
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Player } from "../../types";

interface ModalHeaderProps {
  context: "round" | "team";
  selectedPlayer: Player | null;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  context,
  selectedPlayer,
  onClose
}) => (
  <div className="flex items-center justify-between p-6 border-b">
    <h3 className="text-2xl font-bold text-gray-900">
      {selectedPlayer
        ? `Add Player to ${context === "team" ? "Team" : "Round"}`
        : `Create Player for ${context === "team" ? "Team" : "Round"}`
      }
    </h3>
    <button
      onClick={onClose}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
    >
      <CloseIcon className="w-6 h-6 text-gray-500" />
    </button>
  </div>
);
