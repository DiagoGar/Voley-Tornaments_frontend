'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';

type AnyObj = Record<string, any>;

const asArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray((val as AnyObj).data)) return (val as AnyObj).data;
  if (val && Array.isArray((val as AnyObj).items)) return (val as AnyObj).items;
  return [];
};

export default function TorneosPage() {
  const { user, loading } = useAuth();

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentCategory, setTournamentCategory] = useState('');

  // 🔥 Carga inicial de torneos y categorías
  useEffect(() => {
    if (!user) return; // ⛔ No cargar si no hay usuario aún

    const fetchTournaments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          console.error("No autorizado o error en la API");
          setTournaments([]);
          return;
        }

        const data = await res.json();
        setTournaments(asArray(data));
      } catch (error) {
        console.error("Error cargando torneos:", error);
        setTournaments([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          console.error("No autorizado o error al cargar categorías");
          setCategories([]);
          return;
        }

        const data = await res.json();
        setCategories(asArray(data));
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setCategories([]);
      }
    };

    fetchTournaments();
    fetchCategories();
  }, [user]);

  const handleCreateTournament = async () => {
    if (!tournamentName || !tournamentCategory) {
      alert('Debe ingresar un nombre y una categoría para el torneo');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: tournamentName,
          category: tournamentCategory,
        }),
      });

      if (res.ok) {
        alert('Torneo creado ✅');
        setTournamentName('');
        setTournamentCategory('');

        const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`, {
          credentials: 'include',
        }).then(r => r.json());

        setTournaments(asArray(updated));
      } else {
        const error = await res.json();
        alert(`Error al crear torneo: ${error.error || 'desconocido'}`);
      }
    } catch (err) {
      console.error("Error creando torneo:", err);
      alert('Error de red al crear torneo');
    }
  };

  // ✅ Después de todos los hooks: mostramos condicionales
  if (loading) return <p className="p-6">Verificando sesión...</p>;

  if (!user)
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold mb-3">Acceso restringido</h1>
        <p>Debes iniciar sesión para ver tus torneos.</p>
        <Link href="/login" className="text-blue-600 underline">
          Ir al login
        </Link>
      </div>
    );

  // ✅ Render normal cuando hay usuario
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        🏆 Bienvenido {user?.name}
      </h1>

      <div className="mb-8 border p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">➕ Crear nuevo torneo</h2>
        <input
          className="border p-2 w-full mb-3"
          placeholder="Nombre del torneo"
          value={tournamentName}
          onChange={e => setTournamentName(e.target.value)}
        />
        <select
          className="border p-2 w-full mb-3"
          value={tournamentCategory}
          onChange={e => setTournamentCategory(e.target.value)}
        >
          <option value="">Seleccionar categoría</option>
          {categories.map(c => (
            <option className='bg-gray-700' key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={handleCreateTournament}
        >
          Crear torneo
        </button>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-gray-600">No hay torneos registrados.</p>
      ) : (
        <ul className="space-y-4">
          {tournaments.map(t => (
            <li
              key={t._id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{t.name}</h2>
                <p className="text-sm text-gray-500">
                  Estado:{' '}
                  <span
                    className={
                      t.status === 'open' ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {t.status === 'open' ? 'Abierto' : 'Finalizado'}
                  </span>
                </p>
              </div>
              <Link
                href={`/torneos/${t._id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Ver Torneo
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
