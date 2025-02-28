import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: {
    name: string;
    team_1_id: number;
    team_2_id: number;
    round_id: string;
    date: string;
  }) => Promise<void>;
  teams: { id: number; name: string }[];
  rounds: { id: number; name: string }[];
}

const CreateMatchModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  teams,
}) => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: "",
    team_1_id: "",
    team_2_id: "",
    round_id: id || "",
    date: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      setFormData((prev) => ({ ...prev, round_id: id }));
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreate({
        ...formData,
        team_1_id: Number(formData.team_1_id),
        team_2_id: Number(formData.team_2_id),
        round_id:  id || formData.round_id,
      });
      setFormData({
        name: "",
        team_1_id: "",
        team_2_id: "",
        round_id: id || "",
        date: selectedDate?.toISOString() || "",
      });
      setSelectedDate(null);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                Criar Nova Partida
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <CloseIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Match Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Partida *
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ex: Final do Campeonato"
                    required
                  />
                </div>

                {/* Team Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time 1 *
                    </label>
                    <select
                      name="team_1_id"
                      value={formData.team_1_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    >
                      <option value="">Selecione um time</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time 2 *
                    </label>
                    <select
                      name="team_2_id"
                      value={formData.team_2_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    >
                      <option value="">Selecione um time</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={
                    isSubmitting ||
                    !formData.team_1_id ||
                    !formData.team_2_id
                  }
                >
                  {isSubmitting ? "Criando..." : "Criar Partida"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateMatchModal;
