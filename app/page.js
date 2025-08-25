'use client'
import axios from "axios";
import { useState } from "react";

export default function Home() {
  return (
    <div>
      <ul>
        <li><a href="/equipos/">Ver/Cargar Equipos</a></li>
        <li><a href="/posiciones/">Ver Posiciones</a></li>
        <li><a href="/fixtoure/">Generar Fixtoure</a></li>
        <li><a href="/partidos/">Ver partidos</a></li>
      </ul>
    </div>
  );
}
