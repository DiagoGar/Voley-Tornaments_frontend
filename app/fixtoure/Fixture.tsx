"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function GenerarFixture() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("torneo") || ""; // Captura el torneo desde la URL (?torneo=)

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedSerie, setSelectedSerie] = useState("");
  const [filteredSeries, setFilteredSeries] = useState<any[]>([]);

  // 🔹 Carga torneos y series
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resT, resS] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series`, {
            credentials: "include",
          }),
        ]);

        const dataT = await resT.json();
        const dataS = await resS.json();

        setTournaments(Array.isArray(dataT) ? dataT : dataT.data || []);
        setSeries(Array.isArray(dataS) ? dataS : dataS.data || []);
      } catch (err) {
        console.error("Error cargando torneos o series:", err);
      }
    };

    fetchData();
  }, []);

  // 🔹 Si llega el torneo desde la URL, seleccionarlo automáticamente
  useEffect(() => {
    if (tournamentId) {
      setSelectedTournament(tournamentId);
    }
  }, [tournamentId]);

  // 🔹 Filtrar las series según el torneo seleccionado
  useEffect(() => {
    if (selectedTournament) {
      setFilteredSeries(
        series.filter(
          (s: any) =>
            s.tournament === selectedTournament ||
            s.tournament?._id === selectedTournament
        )
      );
    } else {
      setFilteredSeries([]);
    }
  }, [selectedTournament, series]);

  // 🔹 Generar fixture
  const handleGenerate = async () => {
    if (!selectedTournament || !selectedSerie) {
      alert("Selecciona un torneo y una serie");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fixture/generate`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serieId: selectedSerie }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert(`✅ Fixture generado con éxito: ${result.count} partidos`);
      } else {
        alert(result.error || "Error al generar fixture");
      }
    } catch (error) {
      console.error("Error generando fixture:", error);
      alert("Error de conexión al generar fixture");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Generar Fixture</h1>

      {/* Seleccionar Torneo */}
      <select
        className="border p-2 mb-4 w-full rounded focus:ring focus:ring-blue-300"
        value={selectedTournament}
        onChange={(e) => {
          setSelectedTournament(e.target.value);
          setSelectedSerie("");
        }}
      >
        <option value="">Selecciona un torneo</option>
        {tournaments.map((t: any) => (
          <option className="bg-gray-700" key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Seleccionar Serie */}
      <select
        className="border p-2 mb-4 w-full rounded focus:ring focus:ring-blue-300"
        value={selectedSerie}
        onChange={(e) => setSelectedSerie(e.target.value)}
        disabled={!selectedTournament}
      >
        <option value="">Selecciona una serie</option>
        {filteredSeries.map((s: any) => (
          <option className="bg-gray-700" key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generar Fixture
        </button>

        <a
          href={`../partidos?torneo=${tournamentId}`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
        >
          Ver Partidos
        </a>
      </div>
    </div>
  );
}
