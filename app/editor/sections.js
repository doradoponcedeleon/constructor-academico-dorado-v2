window.PEditor = window.PEditor || {};

PEditor.sections = {
  lista: [],
  cargar() {
    if (window.CADState && window.CADState.editor) {
      return Array.isArray(window.CADState.editor.secciones)
        ? window.CADState.editor.secciones
        : [];
    }
    return [];
  },
  guardar(secciones) {
    if (!window.CADState) return;
    if (!window.CADState.editor) window.CADState.editor = { secciones: [] };
    window.CADState.editor.secciones = Array.isArray(secciones) ? secciones : [];
  },
  agregar(titulo = "Sección", contenido = "") {
    this.lista.push({ titulo, contenido });
  },
  eliminar(index) {
    this.lista.splice(index, 1);
  }
};
