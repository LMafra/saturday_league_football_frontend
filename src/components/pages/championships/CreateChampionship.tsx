import React, { useState } from 'react';
import ReactModal from 'react-modal';

interface CreateChampionshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateChampionshipModal: React.FC<CreateChampionshipModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name); // Pass the name back to the parent
    setName('');
    onClose(); // Close the modal after submission
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="Modal"
      overlayClassName="Overlay"
    >
      <h4 className="header center text_b">Criar Nova Pelada</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </ReactModal>
  );
};

export default CreateChampionshipModal;
