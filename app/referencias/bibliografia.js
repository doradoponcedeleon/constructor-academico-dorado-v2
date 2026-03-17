function generarBibliografia(referencias) {
  if (!Array.isArray(referencias)) return [];
  return referencias.map((ref) => {
    const autor = ref.autor || "Autor";
    const anio = ref.anio || "s.f.";
    const titulo = ref.titulo || "Título";
    const fuente = ref.fuente || "Fuente";
    return `${autor} (${anio}). ${titulo}. ${fuente}.`;
  });
}

function generarBibliografiaDesdeEstado() {
  const refs = window.CADState?.referencias || [];
  return generarBibliografia(refs);
}
