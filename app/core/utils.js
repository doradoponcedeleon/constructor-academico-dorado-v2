window.CADCore = window.CADCore || {};

CADCore.utils = {
  generarId() {
    return `cad_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  },
  fechaActual() {
    return new Date().toISOString();
  },
  clonarObjeto(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  descargarArchivo(nombre, contenido, mime = "application/octet-stream") {
    try {
      const blob = new Blob([contenido], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("No se pudo descargar el archivo", e);
    }
  }
};
