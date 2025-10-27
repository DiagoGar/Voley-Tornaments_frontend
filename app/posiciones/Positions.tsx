"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Posiciones() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSerie, setSelectedSerie] = useState("");
  const [filteredSeries, setFilteredSeries] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const torneoId = searchParams.get("torneo");

  // 🔄 Cargar torneos al inicio
  useEffect(() => {
    const fetchTournaments = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`, {
        credentials: "include",
      });
      const data = await res.json();
      // console.log("datos torneo:", data);

      setTournaments(data);
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (torneoId) {
      setSelectedTournament(torneoId);
    }
  }, [torneoId]);

  // 🔄 Cargar standings y series cuando hay torneo
  useEffect(() => {
    const torneoActivo = selectedTournament || torneoId;
    if (!torneoActivo) return;

    const fetchData = async () => {
      try {
        const standingsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/standings?tournamentId=${torneoActivo}`,
          { credentials: "include" }
        );
        const standingsData = await standingsRes.json();

        const seriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series`, {
          credentials: "include",
        });
        const seriesData = await seriesRes.json();

        // 🔹 Filtrar solo las series que pertenecen al torneo activo
        const filteredByTournament = Array.isArray(seriesData)
          ? seriesData.filter(
              (s: any) =>
                s.tournament === torneoActivo ||
                s.tournament?._id === torneoActivo
            )
          : [];

        setStandings(standingsData);
        setSeries(filteredByTournament);
        setFilteredSeries(filteredByTournament);

        // 🏷️ Extraer categorías de esas mismas series
        const categoriesMap = new Map();
        filteredByTournament.forEach((s: any) => {
          if (s.category) {
            categoriesMap.set(s.category._id, s.category);
          }
        });
        setCategories(Array.from(categoriesMap.values()));
      } catch (err) {
        console.error("Error cargando standings o series:", err);
      }
    };

    fetchData();
  }, [selectedTournament, torneoId]);

  // 📊 Filtro + orden
  const filteredStandings = standings
    .filter((s: any) => {
      const serieId = s.serie?._id;
      const categoryId = s.serie?.category?._id;

      return (
        (!selectedCategory || categoryId === selectedCategory) &&
        (!selectedSerie || serieId === selectedSerie)
      );
    })
    .sort((a: any, b: any) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.pointsFor - a.pointsAgainst;
      const diffB = b.pointsFor - b.pointsAgainst;
      return diffB - diffA;
    });

  // 🏆 Campeón auto
  const champion = (() => {
    const finalStandings = standings.filter(
      (s: any) =>
        s.serie?.name?.toLowerCase() === "final" &&
        s.tournament?._id === selectedTournament
    );

    if (finalStandings.length === 1) {
      return finalStandings[0].team?.name || null;
    }

    if (finalStandings.length > 0) {
      const winner = finalStandings.find((s: any) => s.wins > s.losses);
      return winner?.team?.name || null;
    }

    return null;
  })();

  // ▶️ Avanzar a siguiente fase
  const handleNextRound = async () => {
    if (!selectedTournament) return;
    const confirmAction = confirm("¿Avanzar a la siguiente fase eliminatoria?");
    if (!confirmAction) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matches/next-round/${selectedTournament}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (res.ok) {
        if (data.champion) {
          const championName =
            data.championName ||
            standings.find((s: any) => s.team?._id === data.champion)?.team
              ?.name ||
            data.champion;

          alert(`🏆 Torneo finalizado. Campeón: ${championName}`);
        } else {
          alert(
            data.message ||
              `Siguiente fase generada con ${data.addedMatches} partidos`
          );
        }
      } else {
        alert(`Error: ${data.error || "No se pudo avanzar de fase"}`);
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tabla de Posiciones</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Torneo */}
        <select
          value={selectedTournament}
          onChange={(e) => {
            setSelectedTournament(e.target.value);
            setSelectedCategory("");
            setSelectedSerie("");
          }}
          className="border p-2 rounded"
        >
          <option value="">Seleccionar torneo</option>
          {tournaments.map((t: any) => (
            <option key={t._id} value={t._id} className="bg-gray-800">
              {t.name}
            </option>
          ))}
        </select>

        {/* Categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedCategory(value);
            setSelectedSerie("");
            setFilteredSeries(
              value
                ? series.filter((s: any) => s.category?._id === value)
                : series
            );
          }}
          className="border p-2 rounded"
          disabled={!selectedTournament}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c: any) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Serie */}
        <select
          value={selectedSerie}
          onChange={(e) => setSelectedSerie(e.target.value)}
          className="border p-2 rounded"
          disabled={!selectedTournament}
        >
          <option value="">Todas las series</option>
          {filteredSeries.map((s: any) => (
            <option key={s._id} value={s._id} className="bg-gray-800">
              {s.name}
            </option>
          ))}
        </select>

        {/* ▶️ Avanzar fase */}
        <button
          onClick={handleNextRound}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!selectedTournament}
          title={!selectedTournament ? "Selecciona un torneo" : ""}
        >
          Avanzar a siguiente fase
        </button>
      </div>

      {/* 🏆 Campeón */}
      {champion && (
        <div className="bg-yellow-600 p-3 rounded mb-4 text-center font-bold text-lg">
          🏆 Campeón: {champion}
        </div>
      )}

      {/* Tabla */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-blue-400">
            <th className="border p-2">Pos</th>
            <th className="border p-2">Equipo</th>
            <th className="border p-2">Serie</th>
            <th className="border p-2">Categoría</th>
            <th className="border p-2">PJ</th>
            <th className="border p-2">PG</th>
            <th className="border p-2">PP</th>
            <th className="border p-2">PF</th>
            <th className="border p-2">PC</th>
            <th className="border p-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {filteredStandings.map((s: any, index: number) => (
            <tr key={s._id} className="text-center">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{s.team?.name}</td>
              <td className="border p-2">{s.serie?.name}</td>
              <td className="border p-2">{s.serie?.category?.name}</td>
              <td className="border p-2">{s.matchesPlayed}</td>
              <td className="border p-2">{s.wins}</td>
              <td className="border p-2">{s.losses}</td>
              <td className="border p-2">{s.pointsFor}</td>
              <td className="border p-2">{s.pointsAgainst}</td>
              <td className="border p-2">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="bg-blue-500 text-white px-4 py-2 rounded my-3">
        <a href="../">Volver</a>
      </button>
    </div>
  );
}
