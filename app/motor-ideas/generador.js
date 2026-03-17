function generarDocumentoBasePlataforma(data) {
  const base = {
    markdown: construirMarkdownDocumentoBase(data),
    secciones: null
  };

  const plugin = window.CADPlugins && typeof CADPlugins.obtener === "function"
    ? CADPlugins.obtener("ia-redactor")
    : null;

  if (plugin && typeof CADPlugins.ejecutar === "function") {
    const res = CADPlugins.ejecutar("ia-redactor", { tema: data.tema });
    if (res) {
      base.secciones = [
        { titulo: "Introducción", contenido: res.introduccion || "" },
        { titulo: "Problema", contenido: res.problema || "" },
        { titulo: "Objetivos", contenido: res.objetivos || "" },
        { titulo: "Conclusiones", contenido: res.conclusion || "" }
      ];
      base.titulo = res.titulo || "Título académico sugerido";
    }
  }

  return base;
}

function construirMarkdownDocumentoBase(data) {
  const problema = data.problema || "";
  const ideas = data.ideas || "";
  const conceptos = data.conceptos || "";
  const objetivos = data.objetivos || "";
  return `# Documento base\n\n## Problema\n${problema}\n\n## Ideas\n${ideas}\n\n## Conceptos clave\n${conceptos}\n\n## Objetivos\n${objetivos}\n`;
}
