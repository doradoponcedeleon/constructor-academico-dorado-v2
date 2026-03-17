window.CADCore = window.CADCore || {};

CADCore.storage = {
  guardarEstadoLocal(estado) {
    const key = "constructor_academico_estado_global";
    const data = estado || window.CADState;
    if (!data) return false;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  },
  cargarEstadoLocal() {
    const key = "constructor_academico_estado_global";
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  limpiarEstadoLocal() {
    const key = "constructor_academico_estado_global";
    localStorage.removeItem(key);
  }
};
