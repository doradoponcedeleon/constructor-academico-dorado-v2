function obtenerVersionesPlataforma() {
  if (window.CADState && Array.isArray(window.CADState.versiones)) {
    return window.CADState.versiones;
  }
  return [];
}

function guardarVersionesPlataforma(lista) {
  if (!window.CADState) return;
  window.CADState.versiones = Array.isArray(lista) ? lista : [];
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function restaurarVersionPlataforma(index) {
  const lista = obtenerVersionesPlataforma();
  const version = lista[index];
  if (!version) return;
  window.CADState = CADCore?.utils?.clonarObjeto ? CADCore.utils.clonarObjeto(version.estado) : JSON.parse(JSON.stringify(version.estado));
  if (window.CADCore?.storage?.guardarEstadoLocal) {
    CADCore.storage.guardarEstadoLocal(window.CADState);
  }
}

function eliminarVersionPlataforma(index) {
  const lista = obtenerVersionesPlataforma();
  lista.splice(index, 1);
  guardarVersionesPlataforma(lista);
  renderVersiones();
}
