function obtenerBiblioteca() {
  if (window.CADState && Array.isArray(window.CADState.biblioteca)) {
    return window.CADState.biblioteca;
  }
  return [];
}

function guardarBiblioteca(lista) {
  if (!window.CADState) return;
  window.CADState.biblioteca = Array.isArray(lista) ? lista : [];
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}
