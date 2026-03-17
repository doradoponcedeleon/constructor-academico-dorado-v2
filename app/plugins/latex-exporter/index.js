if (window.CADPlugins && typeof CADPlugins.registrar === "function") {
  CADPlugins.registrar("latex-exporter", {
    nombre: "Exportador LaTeX",
    version: "1.0",
    descripcion: "Convierte CADState a LaTeX",
    run(contexto) {
      const estado = (contexto && contexto.estado) ? contexto.estado : { editor: { secciones: [] } };
      let latex = "\\documentclass{article}\n";
      latex += "\\begin{document}\n";

      (estado.editor && Array.isArray(estado.editor.secciones) ? estado.editor.secciones : []).forEach((sec) => {
        latex += "\\section{" + (sec.titulo || "Sección") + "}\n";
        latex += (sec.contenido || "") + "\n\n";
      });

      latex += "\\end{document}";
      return latex;
    }
  });
}
