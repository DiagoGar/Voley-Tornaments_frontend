"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RegistrarPartido() {
  const [matches, setMatches] = useState<any[]>([]);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [editingTeamA, setEditingTeamA] = useState("");
  const [editingTeamB, setEditingTeamB] = useState("");
  const [editingSerie, setEditingSerie] = useState("");
  const [editingTournament, setEditingTournament] = useState("");

  const searchParams = useSearchParams();
  const torneoId = searchParams.get("torneo"); // 🟢 obtenemos el id del torneo desde la URL

  useEffect(() => {
    fetchMatches();
  }, [torneoId]); // 🟢 recargar cuando cambie el torneo

  const fetchMatches = async () => {
    try {
      // Si hay un torneo en la URL, filtramos
      const url = torneoId
        ? `http://localhost:5000/api/matches?tournamentId=${torneoId}`
        : `http://localhost:5000/api/matches`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar los partidos");
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error("Error al cargar partidos:", err);
      setMatches([]);
    }
  };

  const loadMatchForEdit = (match: any) => {
    if (match.tournament?.status === "closed") {
      alert("Este torneo está finalizado. No puedes editar partidos.");
      return;
    }
    setEditingMatchId(match._id);
    setScore1(match.result?.pointsA?.toString() || "");
    setScore2(match.result?.pointsB?.toString() || "");
    setEditingTeamA(match.teamA?._id);
    setEditingTeamB(match.teamB?._id);
    setEditingSerie(match.serie?._id);
    setEditingTournament(match.tournament?._id);
  };

  const handleUpdate = async () => {
    if (score1 === "" || score2 === "") {
      alert("Por favor completa los puntos");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/matches/${editingMatchId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamA: editingTeamA,
            teamB: editingTeamB,
            serie: editingSerie,
            tournament: editingTournament,
            result: {
              pointsA: parseInt(score1),
              pointsB: parseInt(score2),
            },
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert("Partido actualizado");
        setEditingMatchId(null);
        setScore1("");
        setScore2("");
        fetchMatches(); // recargar después de actualizar
      } else {
        alert(result.error || "Error al actualizar el partido");
      }
    } catch (error: any) {
      console.error("Error en la solicitud:", error);
      alert("Error en la solicitud");
    }
  };

  const cancelEdit = () => {
    setEditingMatchId(null);
    setScore1("");
    setScore2("");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {torneoId ? "Partidos del Torneo" : "Todos los Partidos"}
      </h1>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-500 text-white">
            <th className="p-2 border">Torneo</th>
            <th className="p-2 border">Serie</th>
            <th className="p-2 border">Equipo A</th>
            <th className="p-2 border">Equipo B</th>
            <th className="p-2 border">Puntos</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match._id} className="text-center">
              <td className="p-2 border">{match.tournament?.name}</td>
              <td className="p-2 border">{match.serie?.name}</td>
              <td className="p-2 border">{match.teamA?.name}</td>
              <td className="p-2 border">{match.teamB?.name}</td>
              <td className="p-2 border">
                {editingMatchId === match._id ? (
                  <div className="flex justify-center gap-2">
                    <input
                      type="number"
                      value={score1}
                      onChange={(e) => setScore1(e.target.value)}
                      className="p-1 border w-16 rounded"
                    />
                    <input
                      type="number"
                      value={score2}
                      onChange={(e) => setScore2(e.target.value)}
                      className="p-1 border w-16 rounded"
                    />
                  </div>
                ) : (
                  `${match.result?.pointsA ?? 0} - ${match.result?.pointsB ?? 0}`
                )}
              </td>
              <td className="p-2 border">
                {editingMatchId === match._id ? (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-600 text-white px-2 py-1 text-sm rounded"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-2 py-1 text-sm rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => loadMatchForEdit(match)}
                    disabled={match.tournament?.status === "closed"}
                    className={`px-2 py-1 text-sm rounded ${
                      match.tournament?.status === "closed"
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-yellow-400"
                    }`}
                  >
                    {match.tournament?.status === "closed"
                      ? "Cerrado"
                      : "Editar"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="bg-blue-500 text-white px-4 py-2 rounded my-5">
        <a href={`../posiciones?torneo=${torneoId}`}>Ver Posiciones</a>
      </button>
    </div>
  );
}
