import { PropsWithChildren, useId } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

interface BaseModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formId?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  formId,
  submitDisabled,
  isSubmitting,
  submitLabel = "Criar",
}: BaseModalProps) => {
  const modalTitleId = useId();
  const descriptionId = useId();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onClose();
            }
          }}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            role="presentation"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl"
            role="document"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-6">
              <h3 id={modalTitleId} className="text-2xl font-bold text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
                aria-label="Fechar modal"
              >
                <CloseIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div id={descriptionId} className="p-6">
              {children}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form={formId}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitDisabled || isSubmitting}
                >
                  {isSubmitting ? "Processando..." : submitLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;

