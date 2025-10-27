import { Suspense } from "react";
import RegistrarPartido from "./Matches";

export default function page() {
  // TODO: Estilizar fallback
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegistrarPartido />
    </Suspense>
  );
}
