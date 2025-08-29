import React, { useEffect } from "react";
import { BaseModal } from "../../modal/BaseModal";
import { FormInput } from "../../modal/FormInput";
import { useModalForm } from "../../../hooks/useModalForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: { name: string; round_id: number }) => Promise<void>;
  roundId: number;
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
    error,
    isSubmitting,
    resetForm,
  } = useModalForm({
    name: "",
    round_id: roundId,
  });

  useEffect(() => {
    setFormData({ name: formData.name, round_id: roundId });
  }, [roundId, setFormData, formData.name]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitDisabled = !formData.name;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure round_id is always included in the form data
    const dataToSubmit = { ...formData, round_id: roundId };
    await onCreate(dataToSubmit);
  };

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
      <form id="team-form" onSubmit={handleFormSubmit}>
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
