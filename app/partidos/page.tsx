'use client';

import { useEffect, useState } from 'react';

export default function RegistrarPartido() {
  const [series, setSeries] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [serieId, setSerieId] = useState('');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/series')
      .then(res => res.json())
      .then(data => setSeries(data));

    fetch('http://localhost:5000/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data));

    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const res = await fetch('http://localhost:5000/api/matches');
    const data = await res.json();
    setMatches(data);
  };

  const loadMatchForEdit = (match: any) => {
    setEditingMatchId(match._id);
    setSerieId(match.serie._id);
    setTeam1(match.teamA._id);
    setTeam2(match.teamB._id);
    setScore1(match.result?.pointsA || '');
    setScore2(match.result?.pointsB || '');
  };

  const handleSubmit = async () => {
    if (!team1 || !team2 || !serieId || score1 === '' || score2 === '') {
      alert('Por favor completa todos los campos');
      return;
    }

    if (team1 === team2) {
      alert('Los equipos no pueden ser iguales');
      return;
    }

    const method = editingMatchId ? 'PUT' : 'POST';
    const url = editingMatchId
      ? `http://localhost:5000/api/matches/${editingMatchId}`
      : 'http://localhost:5000/api/matches';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamA: team1,
          teamB: team2,
          serie: serieId,
          result: {
            pointsA: parseInt(score1),
            pointsB: parseInt(score2),
          },
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(editingMatchId ? 'Partido actualizado' : 'Partido registrado');
        resetForm();
        fetchMatches();
      } else {
        console.error(result);
        alert('Error al guardar el partido');
      }
    } catch (error: any) {
      console.error('Error en la solicitud:', error);
      alert('Error en la solicitud');
    }
  };

  const resetForm = () => {
    setEditingMatchId(null);
    setSerieId('');
    setTeam1('');
    setTeam2('');
    setScore1('');
    setScore2('');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {editingMatchId ? 'Editar Partido' : 'Registrar Partido'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select value={serieId} onChange={e => setSerieId(e.target.value)} className="p-2 border">
          <option value="">Selecciona una serie</option>
          {series.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.category?.name || ''})
            </option>
          ))}
        </select>

        <select value={team1} onChange={e => setTeam1(e.target.value)} className="p-2 border">
          <option value="">{team1 || 'Equipo 1'}</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select value={team2} onChange={e => setTeam2(e.target.value)} className="p-2 border">
          <option value="">{team2 || 'Equipo 2'}</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            value={score1}
            onChange={e => setScore1(e.target.value)}
            placeholder="Puntos Equipo 1"
            className="p-2 border w-full"
          />
          <input
            type="number"
            value={score2}
            onChange={e => setScore2(e.target.value)}
            placeholder="Puntos Equipo 2"
            className="p-2 border w-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingMatchId ? 'Actualizar' : 'Registrar'}
        </button>
        {editingMatchId && (
          <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </div>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-2">Partidos Registrados</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Serie</th>
            <th className="p-2 border">Equipo A</th>
            <th className="p-2 border">Equipo B</th>
            <th className="p-2 border">Puntos</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match._id}>
              <td className="p-2 border">{match.serie?.name}</td>
              <td className="p-2 border">{match.teamA?.name}</td>
              <td className="p-2 border">{match.teamB?.name}</td>
              <td className="p-2 border">
                {match.result?.pointsA} - {match.result?.pointsB}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => loadMatchForEdit(match)}
                  className="bg-yellow-400 px-2 py-1 text-sm rounded"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded my-5"
      >
        <a href='../posiciones'>Ver Posiciones</a>
      </button>
    </div>
  );
}
