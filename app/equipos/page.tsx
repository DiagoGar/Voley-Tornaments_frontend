"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type AnyObj = Record<string, any>;

const asArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray((val as AnyObj).data)) return (val as AnyObj).data;
  if (val && Array.isArray((val as AnyObj).items)) return (val as AnyObj).items;
  return [];
};

const getId = (maybePopulated: any): string | undefined => {
  if (!maybePopulated) return undefined;
  if (typeof maybePopulated === "string") return maybePopulated;
  if (typeof maybePopulated === "object") return maybePopulated._id;
  return undefined;
};

export default function CrearEquipo() {
  const searchParams = useSearchParams();
  const tournamentFromURL = searchParams.get("torneo") || "";

  const [name, setName] = useState("");
  const [players, setPlayers] = useState([{ name: "" }, { name: "" }]);

  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);

  const [tournament, setTournament] = useState(tournamentFromURL || "");
  const [category, setCategory] = useState<any>(null);
  const [serie, setSerie] = useState("");

  const [showTeams, setShowTeams] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);

  const [showSerieForm, setShowSerieForm] = useState(false);
  const [newSerieName, setNewSerieName] = useState("");

  // Carga inicial (categorías, series y torneos)
  useEffect(() => {
    fetch("http://localhost:5000/api/categories", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(asArray(data)))
      .catch(() => setCategories([]));

    fetch("http://localhost:5000/api/series", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSeries(asArray(data)))
      .catch(() => setSeries([]));

    fetch("http://localhost:5000/api/tournaments", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setTournaments(asArray(data)))
      .catch(() => setTournaments([]));
  }, []);

  // Si cambia el torneo seleccionado, traer la categoría del torneo y limpiar selección de serie
  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournament) {
        setCategory(null);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/tournaments/${tournament}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("No se pudo cargar el torneo");
        const data = await res.json();
        setCategory(data.category || null);
        setSerie("");
      } catch (err) {
        console.error("Error al cargar torneo:", err);
        setCategory(null);
      }
    };

    fetchTournament();
  }, [tournament]);

  const handlePlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = value;
    setPlayers(updatedPlayers);
  };

  // Crear equipo
  const handleSubmit = async () => {
    if (!tournament || !category || !serie) {
      alert("Debe seleccionar torneo, categoría y serie");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          players,
          category: category?._id,
          serie,
          tournament,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          typeof data === "string"
            ? data
            : data.error || data.message || "Error desconocido al crear el equipo.";
        alert(`⚠️ ${message}`);
        return;
      }

      alert("✅ Equipo creado con éxito");
      setName("");
      setPlayers([{ name: "" }, { name: "" }]);
      // recargar tabla si está visible
      if (showTeams) fetchTeams();
    } catch (err) {
      console.error("Error de red al crear equipo:", err);
      alert("❌ No se pudo conectar con el servidor. Intente nuevamente.");
    }
  };

  // Crear serie dentro del torneo y categoría seleccionados
  const handleCreateSerie = async () => {
    if (!newSerieName || !category || !tournament) {
      alert("Debe ingresar un nombre y tener seleccionados torneo y categoría");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newSerieName,
          category: category?._id,
          tournament,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error al crear serie:", data);
        const message =
          typeof data === "string"
            ? data
            : data.error || data.message || "Error desconocido al crear la serie.";
        alert(`⚠️ ${message}`);
        return;
      }

      alert("✅ Serie creada con éxito");
      setNewSerieName("");
      setShowSerieForm(false);

      // recargar series y seleccionar la nueva
      const seriesRes = await fetch("http://localhost:5000/api/series", {
        credentials: "include",
      });
      const updatedSeries = asArray(await seriesRes.json());
      setSeries(updatedSeries);

      const nueva = updatedSeries.find(
        (s: any) =>
          s.name === newSerieName &&
          getId(s.tournament) === tournament &&
          getId(s.category) === category?._id
      );
      if (nueva) setSerie(nueva._id);
    } catch (err) {
      console.error("Error de red al crear serie:", err);
      alert("❌ No se pudo conectar con el servidor. Intente nuevamente.");
    }
  };

  const fetchTeams = async () => {
    try {
      const params: string[] = [];
      if (tournament) params.push(`tournamentId=${tournament}`);
      const url = params.length > 0 ? `/api/teams?${params.join("&")}` : "/api/teams";

      const res = await fetch(`http://localhost:5000${url}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("Error fetching teams:", err);
        setTeams([]);
        return;
      }

      const data = await res.json();
      setTeams(asArray(data));
    } catch (err) {
      console.error("Error al cargar equipos:", err);
      alert("Error al cargar equipos. Intente nuevamente.");
    }
  };

  const seriesList = asArray(series);

  const seriesForSelect = seriesList.filter((s: any) => {
    const sCat = getId(s?.category);
    const sTor = getId(s?.tournament);
    // comparo con category._id y tournament
    return (!category?._id || sCat === category._id) && sTor === tournament;
  });

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Equipos</h1>

      {/* Selección de torneo/categoría/serie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          className="border p-2 w-full"
          value={tournament}
          disabled={!!tournamentFromURL}
          onChange={(e) => {
            setTournament(e.target.value);
            setSerie("");
          }}
        >
          <option value="">Seleccionar torneo</option>
          {asArray(tournaments).map((t: any) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="border p-2 w-full bg-gray-100 text-gray-700 rounded">
          Categoría: <strong>{category?.name || "Sin categoría"}</strong>
        </div>

        <select
          className="border p-2 w-full"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          disabled={!category || !tournament}
        >
          <option value="">Seleccionar serie</option>
          {seriesForSelect.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ➕ Crear Serie */}
      <div className="mb-4">
        <button
          onClick={() => setShowSerieForm(!showSerieForm)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
          disabled={!tournament || !category}
        >
          {showSerieForm ? "Cancelar" : "➕ Crear Serie"}
        </button>

        {showSerieForm && (
          <div className="mt-3 border-none p-3 bg-gray-800">
            <input
              className="border rounded p-2 w-full mb-2"
              placeholder="Nombre de la serie (ej: Serie A, Finales...)"
              value={newSerieName}
              onChange={(e) => setNewSerieName(e.target.value)}
            />

            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleCreateSerie}
            >
              Guardar Serie
            </button>
          </div>
        )}
      </div>

      {/* Formulario de equipo */}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Nombre del equipo"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h2 className="font-semibold">Jugadores:</h2>
      {players.map((player, i) => (
        <input
          key={i}
          className="border p-2 w-full mb-2"
          placeholder={`Jugador ${i + 1}`}
          value={player.name}
          onChange={(e) => handlePlayerChange(i, e.target.value)}
        />
      ))}

      {/* Botones principales */}
      <div className="flex gap-3 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Crear equipo
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            const newValue = !showTeams;
            setShowTeams(newValue);
            if (newValue) fetchTeams();
          }}
        >
          {showTeams ? "Ocultar equipos" : "Ver equipos cargados"}
        </button>

        <a
          href={`../fixtoure?torneo=${tournament}`}
          className="bg-blue-500 text-white px-4 py-2 rounded text-center"
        >
          Generar Fixtoure
        </a>
      </div>

      {/* Tabla de equipos (visibilidad controlada por showTeams) */}
      {showTeams && (
        <div className="overflow-x-auto">
          {teams.length === 0 ? (
            <p className="text-gray-600">No hay equipos para este torneo/serie.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-500">
                  <th className="border p-2">Nombre</th>
                  <th className="border p-2">Torneo</th>
                  <th className="border p-2">Categoría</th>
                  <th className="border p-2">Serie</th>
                  <th className="border p-2">Jugadores</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t: any) => (
                  <tr key={t._id}>
                    <td className="border bg-gray-900 p-2">{t.name}</td>
                    <td className="border bg-gray-900 p-2">{t.tournament?.name}</td>
                    <td className="border bg-gray-900 p-2">{t.category?.name}</td>
                    <td className="border bg-gray-900 p-2">{t.serie?.name}</td>
                    <td className="border bg-gray-900 p-2">
                      {asArray(t.players).map((p: any) => p.name).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}
