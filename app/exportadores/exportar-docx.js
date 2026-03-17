function exportarDOCXPlataforma() {
  const state = typeof getState === "function" ? getState() : window.CADState;
  const html = `
    <h1>Constructor Académico Dorado</h1>
    <pre>${JSON.stringify(state, null, 2)}</pre>
  `;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "constructor-academico-dorado.doc";
  link.click();
  URL.revokeObjectURL(url);
}
