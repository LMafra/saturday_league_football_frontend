import React, { useEffect, useState } from 'react';
import championshipService from '../../../services/championshipService';
import { format } from 'date-fns';
import CreateChampionshipModal from './CreateChampionshipModal';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

function Championships() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);



  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const data = await championshipService.getAll();
        setChampionships(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      }
    };

    fetchChampionships();
  }, []);

  const handleCreateChampionship = async (formData: { name: string }) => {
    try {
      const createdChampionship = await championshipService.create(formData);
      setMessage(`Pelada "${createdChampionship.name}" criada com sucesso!`);
      setOpen(true);

      // Refresh the championships list
      const data = await championshipService.getAll();
      setChampionships(data);
    } catch (err: any) {
      setMessage(err.message || 'Ocorreu um erro');
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='section no-pad-bot no-pad-top'>
      <section className="section">
        <div className='container'>
          <h2 className='header center text_b'>Peladas Cadastradas</h2>
          <button className="btn-large waves-effect waves-light" onClick={() => setIsModalOpen(true)}>
            Nova Pelada
          </button>
          <div className='row'>
            {championships.length === 0 ? (
              <p>Sem Peladas.</p>
            ) : (
              <div>
                {championships.map((championship) => (
                  <div className="col s12 m4">
                    <div className="card card-avatar small" key={championship.id}>
                      <div className='card-content'>
                        <div className='card-title grey-text text-darken-4'>
                          <h5 className='center'>
                            {championship.name}
                          </h5>
                        </div>
                        <div className='card-image waves-effect waves-block waves-light'></div>
                        <p className='justify'>
                        ({format(championship.created_at, 'dd/MM/yyyy')})
                        </p>
                        <p className='justify'>
                          {championship.round_total} rodadas
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {isModalOpen && <CreateChampionshipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateChampionship}
        />}
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message={message}
        />
      </section>
    </div>
  );
}
export default Championships;
