import React, { useEffect } from "react";
import { BaseModal } from "../../modal/BaseModal";
import { FormInput } from "../../modal/FormInput";
import { useModalForm } from "../../../hooks/useModalForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: {
    name: string;
    team_1_id: number;
    team_2_id: number;
    round_id: number;
    date: string;
  }) => Promise<void>;
  teams: { id: number; name: string }[];
  roundId: number;
}

const CreateMatchModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  teams,
  roundId,
}) => {
  const {
    formData,
    setFormData,
    handleChange,
    error,
    isSubmitting,
    resetForm,
  } = useModalForm({
    name: "",
    team_1_id: "",
    team_2_id: "",
    round_id: roundId,
    date: "",
  });

  useEffect(() => {
    setFormData({
      name: formData.name,
      team_1_id: formData.team_1_id,
      team_2_id: formData.team_2_id,
      round_id: roundId,
      date: formData.date
    });
  }, [roundId, setFormData, formData.name, formData.team_1_id, formData.team_2_id, formData.date]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitDisabled = !formData.team_1_id || !formData.team_2_id;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure round_id is always included in the form data and convert string IDs to numbers
    const dataToSubmit = {
      ...formData,
      round_id: roundId,
      team_1_id: Number(formData.team_1_id),
      team_2_id: Number(formData.team_2_id)
    };
    await onCreate(dataToSubmit);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Nova Partida"
      formId="match-form"
      isSubmitting={isSubmitting}
      submitDisabled={submitDisabled}
      submitLabel="Criar Partida"
    >
      <form id="match-form" onSubmit={handleFormSubmit}>
        <FormInput
          label="Nome da Partida"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Final do Campeonato"
          required
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <FormInput
            label="Time 1"
            name="team_1_id"
            value={formData.team_1_id}
            onChange={handleChange}
            placeholder="Selecione um time"
            type="select"
            options={teams.map((t) => ({ id: t.id, name: t.name }))}
            required
          />

          <FormInput
            label="Time 2"
            name="team_2_id"
            value={formData.team_2_id}
            onChange={handleChange}
            placeholder="Selecione um time"
            type="select"
            options={teams.map((t) => ({ id: t.id, name: t.name }))}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-6">
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default CreateMatchModal;
