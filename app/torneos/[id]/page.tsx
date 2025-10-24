"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TorneoDetallePage() {
  const { id } = useParams();
  const router = useRouter();

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);

  // 🔄 Traer datos del torneo
  const fetchTournament = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${id}`, {
        method: "GET",
        credentials: "include"
      });

      if (!res.ok) throw new Error("No se pudo cargar el torneo");
      const data = await res.json();
      setTournament(data);
    } catch (err) {
      console.error("Error al cargar torneo:", err);
      setTournament(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTournament();
  }, [id]);

  // ✅ Finalizar torneo
  const handleFinalize = async () => {
    if (!confirm("¿Seguro que deseas finalizar este torneo?")) return;

    try {
      setFinalizing(true);
      const res = await fetch(
        `http://localhost:5000/api/tournaments/${id}/finalize`,
        {
          method: "PUT",
          credentials: "include"
        }
      );

      if (res.ok) {
        const data = await res.json();
        alert("✅ Torneo finalizado correctamente");
        setTournament(data.torneo);
      } else {
        const errorData = await res.json();
        alert(`❌ Error al finalizar: ${errorData.error || "Intenta de nuevo"}`);
      }
    } catch (err) {
      console.error("Error en finalizar:", err);
      alert("❌ Error en la conexión con el servidor");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <p className="p-6">Cargando torneo...</p>;
  if (!tournament)
    return <p className="p-6 text-red-600">Torneo no encontrado.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🏆 {tournament.name}</h1>

      <p className="text-gray-700 mb-2">
        Estado:{" "}
        <span
          className={
            tournament.status === "open" ? "text-green-600" : "text-red-600"
          }
        >
          {tournament.status === "open" ? "Abierto" : "Finalizado"}
        </span>
      </p>

      {tournament.finishedAt && (
        <p className="text-gray-500 mb-4">
          Finalizado en:{" "}
          {new Date(tournament.finishedAt).toLocaleDateString("es-AR")}
        </p>
      )}

      {/* Opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link
          href={`/partidos?torneo=${tournament._id}`}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center shadow hover:bg-blue-700 transition"
        >
          ⚔️ Gestionar Partidos
        </Link>

        <Link
          href={`/posiciones?torneo=${tournament._id}`}
          className="bg-green-600 text-white px-4 py-3 rounded-lg text-center shadow hover:bg-green-700 transition"
        >
          📊 Ver Posiciones
        </Link>

        <Link
          href={`/equipos?torneo=${tournament._id}`}
          className="bg-gray-400 hover:bg-gray-200 p-6 rounded-lg shadow text-center transition"
        >
          👥 Gestión de Equipos
        </Link>

        {tournament.status === "open" && (
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="bg-red-600 text-white px-4 py-3 rounded-lg text-center shadow hover:bg-red-700 transition disabled:opacity-50"
          >
            {finalizing ? "Finalizando..." : "🚫 Finalizar Torneo"}
          </button>
        )}
      </div>

      <div className="mt-8">
        <button
          onClick={() => router.push("/torneos")}
          className="text-blue-600 underline hover:text-blue-800 transition"
        >
          ← Volver a la lista de torneos
        </button>
      </div>
    </div>
  );
}
