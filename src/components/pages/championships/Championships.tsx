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
    <div>
      <h1>Championships</h1>
      {championships.length === 0 ? (
        <p>No championships found.</p>
      ) : (
        <ul>
          {championships.map((championship) => (
            <li key={championship.id}>
              {championship.name} ({format(championship.created_at, 'dd/MM/yyyy')}) - {championship.round_total} rodadas
            </li>
          ))}
        </ul>
      )}
      <h1>Create Championship</h1>
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
  );
}
export default Championships;
