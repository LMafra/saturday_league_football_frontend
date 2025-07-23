import React from "react";
import { BaseModal } from "../../modal/BaseModal";
import { FormInput } from "../../modal/FormInput";
import { useModalForm } from "../../../hooks/useModalForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: { name: string; description?: string }) => Promise<void>;
}

const CreateChampionshipModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const {
    formData,
    handleChange,
    handleSubmit,
    error,
    isSubmitting,
    resetForm,
  } = useModalForm({ name: "", description: "" });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Nova Pelada"
      formId="championship-form"
      isSubmitting={isSubmitting}
    >
      <form id="championship-form" onSubmit={(e) => handleSubmit(onCreate, e)}>
        <FormInput
          label="Nome da Pelada"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Pelada da Empresa"
          required
        />

        <FormInput
          label="Descrição (Opcional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Adicione uma descrição para sua pelada"
          type="textarea"
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

export default CreateChampionshipModal;
