"use client";

import { useEffect, useState } from "react";

export default function CrearEquipo() {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([{ name: "" }, { name: "" }]);
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [serie, setSerie] = useState("");

  const [showTeams, setShowTeams] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);

  // nuevos estados para filtros de la tabla
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSerie, setFilterSerie] = useState("");

  // estados para crear series
  const [showSerieForm, setShowSerieForm] = useState(false);
  const [newSerieName, setNewSerieName] = useState("");
  const [newSerieCategory, setNewSerieCategory] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch("http://localhost:5000/api/series")
      .then((res) => res.json())
      .then((data) => setSeries(data));
  }, []);

  const handlePlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = value;
    setPlayers(updatedPlayers);
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        players,
        category,
        serie,
      }),
    });

    if (res.ok) {
      alert("Equipo creado con éxito");
      setName("");
      setPlayers([{ name: "" }, { name: "" }]);
      fetchTeams();
    } else {
      alert("Error al crear equipo");
    }
  };

  const handleCreateSerie = async () => {
    if (!newSerieName || !newSerieCategory) {
      alert("Debe ingresar un nombre y seleccionar categoría");
      return;
    }

    const res = await fetch("http://localhost:5000/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newSerieName,
        category: newSerieCategory,
      }),
    });

    if (res.ok) {
      alert("Serie creada con éxito ✅");
      setNewSerieName("");
      setNewSerieCategory("");
      setShowSerieForm(false);

      // recargar series disponibles
      const data = await fetch("http://localhost:5000/api/series").then((r) =>
        r.json()
      );
      setSeries(data);
    } else {
      alert("Error al crear serie");
    }
  };

  const fetchTeams = async () => {
    let url = "http://localhost:5000/api/teams";
    const params = [];

    if (filterCategory) params.push(`category=${filterCategory}`);
    if (filterSerie) params.push(`serie=${filterSerie}`);

    if (params.length > 0) url += `?${params.join("&")}`;

    const res = await fetch(url);
    const data = await res.json();
    setTeams(data);
  };

  useEffect(() => {
    if (showTeams) {
      fetchTeams();
    }
  }, [filterCategory, filterSerie, showTeams]);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Equipo</h1>

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

      {/* Selects para creación */}
      <select
        className="border p-2 w-full mb-3"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Seleccionar categoría</option>
        {categories.map((c: any) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 w-full mb-3"
        value={serie}
        onChange={(e) => setSerie(e.target.value)}
        disabled={!category}
      >
        <option value="">Seleccionar serie</option>
        {series
          .filter((s: any) => s.category._id === category)
          .map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
      </select>

      {/* Botón para abrir form de nueva serie */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowSerieForm(!showSerieForm)}
          className="text-sm text-blue-600 underline"
        >
          {showSerieForm ? "Cancelar creación de serie" : "➕ Crear nueva serie"}
        </button>

        {showSerieForm && (
          <div className="mt-3 border p-3 rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Nueva serie</h3>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Nombre de la serie (ej: Serie A, Finales...)"
              value={newSerieName}
              onChange={(e) => setNewSerieName(e.target.value)}
            />

            <select
              className="border p-2 w-full mb-2"
              value={newSerieCategory}
              onChange={(e) => setNewSerieCategory(e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={handleCreateSerie}
            >
              Guardar serie
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Crear equipo
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowTeams(!showTeams)}
        >
          {showTeams ? "Ocultar equipos" : "Ver equipos cargados"}
        </button>

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          <a href="../fixtoure">Generar Fixtoure</a>
        </button>
      </div>

      {showTeams && (
        <>
          {/* filtros */}
          <div className="flex gap-4 mb-4">
            <select
              className="border p-2"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSerie("");
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="border p-2"
              value={filterSerie}
              onChange={(e) => setFilterSerie(e.target.value)}
              disabled={!filterCategory}
            >
              <option value="">Todas las series</option>
              {series
                .filter((s: any) => s.category._id === filterCategory)
                .map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            <button
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={fetchTeams}
            >
              Buscar
            </button>
          </div>

          {/* tabla */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Categoría</th>
                <th className="border p-2">Serie</th>
                <th className="border p-2">Jugadores</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t: any) => (
                <tr key={t._id}>
                  <td className="border p-2">{t.name}</td>
                  <td className="border p-2">{t.category?.name}</td>
                  <td className="border p-2">{t.serie?.name}</td>
                  <td className="border p-2">
                    {t.players.map((p: any) => p.name).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
