import React, { useEffect, useState } from 'react';
import championshipService from '../../../services/championshipService';
import { format } from 'date-fns'

function Championships() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: ''});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all championships on component mount
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdChampionship = await championshipService.create(formData);
      setMessage(`Championship "${createdChampionship.name}" created successfully!`);
    } catch (err: any) {
      setMessage(err.message || 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className='section no-pad-bot no-pad-top'>
      <section className="section">
        <div className='container'>
          <h2 className='header center text_b'>Peladas Cadastradas</h2>
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
                        ({format(championship.created_at, 'dd/MM/yyyy')}) - {championship.round_total} rodadas
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='container'>
          <h4 className='header center text_b'>Criar Pelada</h4>
          <div className='row'>
            <h1></h1>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name:</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit">Create</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
export default Championships;
