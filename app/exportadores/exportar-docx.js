function exportarDOCXPlataforma() {
  const state = typeof getState === "function" ? getState() : window.CADState;
  const contenido = window.obtenerDocumentoFinalPlataforma
    ? window.obtenerDocumentoFinalPlataforma()
    : (localStorage.getItem("documento_editor") || localStorage.getItem("documento_base") || "");
  const html = `
    <h1>${state?.metadata?.titulo || "Constructor Académico Dorado"}</h1>
    <pre>${String(contenido || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  `;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "constructor-academico-dorado.doc";
  link.click();
  URL.revokeObjectURL(url);
}
