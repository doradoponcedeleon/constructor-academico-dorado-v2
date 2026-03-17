function resumenDesdeLocalStorage() {
  const referencias = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];
  const estado = localStorage.getItem("estado_arte") || "";
  const vacios = localStorage.getItem("vacios_investigacion") || "";
  const hipotesis = localStorage.getItem("hipotesis") || "";
  const temas = localStorage.getItem("temas_investigacion") || "";
  const tendencias = localStorage.getItem("tendencias_cientificas") || "";

  let md = "# Hub de Investigación\n\n";
  md += "## Referencias guardadas\n\n";
  if (referencias.length) {
    md += referencias.slice(0, 5).map((r) => {
      const autor = r.autor || r.autores || "Autor";
      const anio = r.anio || "s.f.";
      const titulo = r.titulo || "Título";
      return `- ${autor} (${anio}). ${titulo}.`;
    }).join("\n");
  } else {
    md += "No hay referencias guardadas.";
  }
  md += "\n\n## Principales tendencias\n\n" + (tendencias ? tendencias.slice(0, 600) + "..." : "No hay análisis de tendencias.");
  md += "\n\n## Vacíos detectados\n\n" + (vacios ? vacios.slice(0, 600) + "..." : "No hay vacíos detectados.");
  md += "\n\n## Hipótesis sugeridas\n\n" + (hipotesis ? hipotesis.slice(0, 600) + "..." : "No hay hipótesis generadas.");
  md += "\n\n## Temas propuestos\n\n" + (temas ? temas.slice(0, 600) + "..." : "No hay temas propuestos.");
  md += "\n\n## Próximos pasos recomendados\n\n";
  md += "- Completar el estado del arte con nuevas fuentes.\n";
  md += "- Refinar hipótesis y variables principales.\n";
  md += "- Definir la metodología y población de estudio.\n";
  md += "- Validar tendencias con evidencia empírica.\n";

  return md;
}

async function buscarPapersDesdeHub(query) {
  if (typeof buscarPapersCrossRef === "function") {
    return await buscarPapersCrossRef(query);
  }
  if (typeof buscarPapersSemanticScholarProxy === "function") {
    return await buscarPapersSemanticScholarProxy(query);
  }
  throw new Error("No hay buscador disponible");
}
