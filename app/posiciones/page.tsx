import { Suspense } from "react";

import Posiciones from "./Positions";

export default function page() {
  // TODO: Estilizar fallback
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Posiciones />
    </Suspense>
  );
}
