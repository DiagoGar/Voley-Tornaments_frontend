"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ IMPORTANTE
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Bienvenido ${data.user.name}`);
        router.push("/torneos");
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      alert("❌ Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">🔑 Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}
