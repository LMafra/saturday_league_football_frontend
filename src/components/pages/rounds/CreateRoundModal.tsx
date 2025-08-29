import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { BaseModal } from "../../modal/BaseModal";
import { FormInput } from "../../modal/FormInput";
import { useModalForm } from "../../../hooks/useModalForm";
interface FormData extends Record<string, unknown> {
  name: string;
  round_date: string;
  championship_id: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: FormData) => Promise<void>;
}

const CreateRoundModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { id: championshipId } = useParams<{ id: string }>();
  const {
    formData,
    setFormData,
    handleChange,

    error,
    isSubmitting,
    resetForm,
  } = useModalForm<FormData>({
    name: "",
    round_date: "",
    championship_id: Number(championshipId) || 0,
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (championshipId) {
      setFormData({
        ...formData,
        championship_id: Number(championshipId)
      });
    }
  }, [championshipId, setFormData, formData]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setFormData({
      ...formData,
      round_date: date.toISOString(),
    });
  };

  const handleClose = () => {
    resetForm();
    setSelectedDate(null);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Nova Rodada"
      formId="round-form"
      isSubmitting={isSubmitting}
    >
      <form id="round-form" onSubmit={(e) => {
        e.preventDefault();
        const dataWithNumberId = {
          ...formData,
          championship_id: Number(formData.championship_id)
        };
        onCreate(dataWithNumberId);
      }}>
        <FormInput
          label="Nome da Rodada"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: 1ª Rodada"
          required
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data da Rodada *
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione uma data"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
            popperClassName="react-datepicker-popper"
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

export default CreateRoundModal;
