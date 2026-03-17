function exportarPDFPlataforma() {
  const state = window.CADState || {};
  const secciones = state.editor?.secciones || [];
  const titulo = state.metadata?.titulo || "Documento académico";

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

  doc.setFontSize(12);
  secciones.forEach((sec) => {
    if (y > 260) { doc.addPage(); y = 20; }
    const heading = sec.titulo || "Sección";
    doc.setFontSize(14);
    doc.text(heading, 14, y);
    y += 6;

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(sec.contenido || "", 170);
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 5;
    });
    y += 6;
  });

  doc.save("paper-academico.pdf");
}
