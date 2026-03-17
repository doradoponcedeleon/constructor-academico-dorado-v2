function exportarJSONPlataforma() {
  const state = window.CADState || {};
  const contenido = JSON.stringify(state, null, 2);
  if (window.CADCore?.utils?.descargarArchivo) {
    CADCore.utils.descargarArchivo("constructor-academico-dorado.json", contenido, "application/json");
    return;
  }
  const blob = new Blob([contenido], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "constructor-academico-dorado.json";
  link.click();
  URL.revokeObjectURL(url);
}
