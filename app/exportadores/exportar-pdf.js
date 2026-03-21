function exportarPDFPlataforma() {
  const state = window.CADState || {};
  const titulo = state.metadata?.titulo || "Documento académico";
  const contenido = window.obtenerDocumentoFinalPlataforma
    ? window.obtenerDocumentoFinalPlataforma()
    : (localStorage.getItem("documento_editor") || "");

  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("jsPDF no está disponible.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  doc.setFontSize(18);
  doc.text(titulo, 14, y);
  doc.setFontSize(10);
  doc.text("Generado: " + new Date().toLocaleDateString(), 14, y + 6);
  y += 12;

  doc.setFontSize(11);
  const lines = doc.splitTextToSize(contenido || "", 170);
  lines.forEach((line) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(line, 14, y);
    y += 5;
  });

  doc.save("paper-academico.pdf");
}
