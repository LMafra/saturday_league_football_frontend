import { useState } from "react";

export const useModalForm = <T extends Record<string, any>>(
  initialState: T,
) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const resetForm = () => {
    setFormData(initialState);
    setError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (
    callback: (data: T) => Promise<void>,
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await callback(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    error,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
