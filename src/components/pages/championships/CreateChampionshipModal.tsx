import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: { name: string }) => Promise<void>;
}

const CreateChampionshipModal: React.FC<ModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreate(formData);
      setFormData({ name: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="lean-overlay" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-content">
          <div className="row">
            <h4 className="col s11">Criar Nova Pelada</h4>
            <CloseIcon className="modal-close col s1" onClick={onClose}/>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="validate"
                  required
                />
                <label>Nome da Pelada</label>
              </div>
            </div>

            {error && (
              <div className="row red-text">
                <div className="col s12">{error}</div>
              </div>
            )}

            <div className="modal-footer">
              <button
                type="button"
                className="btn-flat waves-effect"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn waves-effect waves-light"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateChampionshipModal;
