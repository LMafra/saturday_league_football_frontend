import BaseModal from "@/shared/components/modal/BaseModal";
import FormInput from "@/shared/components/modal/FormInput";
import { useModalForm } from "@/shared/hooks/useModalForm";

interface CreateChampionshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: { name: string; description?: string }) => Promise<void>;
}

const CreateChampionshipModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateChampionshipModalProps) => {
  const { formData, handleChange, handleSubmit, error, isSubmitting, resetForm } = useModalForm({
    name: "",
    description: "",
  });

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
      <form id="championship-form" onSubmit={(event) => handleSubmit(onCreate, event)}>
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
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3">
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default CreateChampionshipModal;

