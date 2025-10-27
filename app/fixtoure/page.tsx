import { Suspense } from "react";

import GenerarFixture from "./Fixture";

export default function page() {
  return (
    // TODO: Estilizar fallback
    <Suspense fallback={<div>Cargando...</div>}>
      <GenerarFixture />
    </Suspense>
  );
}
