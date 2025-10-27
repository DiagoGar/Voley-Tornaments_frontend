import { Suspense } from "react";

import CrearEquipo from "./CreateTeam";

export default function page() {
  return (
    // TODO: Estilizar fallback
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearEquipo />
    </Suspense>
  );
}
