import React, { useEffect } from "react";
import { BaseModal } from "../../modal/BaseModal";
import { FormInput } from "../../modal/FormInput";
import { useModalForm } from "../../../hooks/useModalForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: { name: string; round_id: string }) => Promise<void>;
  roundId: string;
}

const CreateTeamModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  roundId,
}) => {
  const {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    error,
    isSubmitting,
    resetForm,
  } = useModalForm({
    name: "",
    round_id: roundId,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, round_id: roundId }));
  }, [roundId, setFormData]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitDisabled = !formData.name;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Novo Time"
      formId="team-form"
      isSubmitting={isSubmitting}
      submitDisabled={submitDisabled}
      submitLabel="Criar Time"
    >
      <form id="team-form" onSubmit={(e) => handleSubmit(onCreate, e)}>
        <FormInput
          label="Nome do Time"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Time do Bairro"
          required
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-6">
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default CreateTeamModal;
