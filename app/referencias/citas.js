function generarCitaAPA(ref) {
  if (!ref) return "";
  const autor = ref.autor || "Autor";
  const anio = ref.anio || "s.f.";
  return `(${autor}, ${anio})`;
}

function obtenerCitasAPADesdeEstado() {
  const refs = window.CADState?.referencias || [];
  return refs.map((r) => generarCitaAPA(r)).filter(Boolean);
}
