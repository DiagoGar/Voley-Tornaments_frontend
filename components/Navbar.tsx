"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-xl font-bold hover:text-blue-400">
          🏐 VóleyTorneos
        </Link>
      </div>

      {/* Menú principal */}
      {/* <div className="flex gap-6 items-center">
        <Link href="/equipos" className="hover:text-blue-400 transition">
          Equipos
        </Link>
        <Link href="/fixtoure" className="hover:text-blue-400 transition">
          Fixture
        </Link>
        <Link href="/partidos" className="hover:text-blue-400 transition">
          Partidos
        </Link>
        <Link href="/posiciones" className="hover:text-blue-400 transition">
          Posiciones
        </Link>
      </div> */}

      {/* Usuario o login/register */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-300">
              👋 Hola, {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
