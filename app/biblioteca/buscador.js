function buscarDocumentosBiblioteca(texto) {
  const lista = obtenerBiblioteca();
  const q = (texto || "").toLowerCase();
  if (!q) return lista;
  return lista.filter((d) => (d.nombre || "").toLowerCase().includes(q));
}
