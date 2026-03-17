function obtenerTituloArticulo() {
  try {
    const base = typeof safeGetJSON === "function" ? safeGetJSON("tesis_base", null) : null;
    if (base?.tema) return base.tema;
  } catch (e) {
    // ignore
  }
  const doc = localStorage.getItem("documento_base") || "";
  if (doc) {
    const line = doc.split("\n").find((l) => l.trim());
    if (line) return line.replace(/^#+\s*/, "").trim();
  }
  return "Título del artículo";
}

function construirReferenciasAPAArticulo(lista) {
  if (!Array.isArray(lista) || !lista.length) return "No hay referencias registradas.";
  return lista.map((r) => {
    const autor = r.autor || r.autores || "Autor";
    const anio = r.anio || "s.f.";
    const titulo = r.titulo || "Título";
    const fuente = r.revista || r.fuente || "";
    return `${autor} (${anio}). ${titulo}. ${fuente}`.trim();
  }).join("\n");
}

function generarArticuloCientifico() {
  const titulo = obtenerTituloArticulo();
  const estadoArte = localStorage.getItem("estado_arte") || "";
  const vacios = localStorage.getItem("vacios_investigacion") || "";
  const hipotesis = localStorage.getItem("hipotesis") || "";
  const metodologia = localStorage.getItem("metodologia") || "";
  const referencias = typeof safeGetJSON === "function" ? safeGetJSON("referencias", []) : [];

  const abstract = `Este artículo analiza el tema **${titulo}**, sintetizando evidencias previas y planteando aportes derivados de la investigación. Se presentan antecedentes, fundamentos teóricos, metodología y resultados esperados.`;
  const palabrasClave = "investigación, marco teórico, metodología, resultados";

  const intro = estadoArte
    ? estadoArte
    : "La introducción presenta el contexto y la relevancia del problema de investigación, articulando aportes previos.";

  const marco = vacios
    ? vacios
    : "El marco teórico consolida aportes fundamentales y delimita el campo de estudio.";

  const resultados = "Se esperan resultados que clarifiquen las relaciones entre variables clave y su impacto en el fenómeno analizado.";
  const discusion = "La discusión interpretará los resultados en función de la literatura previa y las hipótesis planteadas.";
  const conclusiones = "Las conclusiones sintetizan los aportes centrales, limitaciones y proyecciones futuras.";

  const referenciasTexto = construirReferenciasAPAArticulo(referencias);

  const doc = `# ${titulo}\n\n` +
    `## Abstract\n${abstract}\n\n` +
    `## Palabras clave\n${palabrasClave}\n\n` +
    `## 1. Introducción\n${intro}\n\n` +
    `## 2. Marco teórico\n${marco}\n\n` +
    `## 3. Metodología\n${metodologia || "Metodología no disponible. Genera la metodología para completar esta sección."}\n\n` +
    `## 4. Resultados esperados\n${resultados}\n\n` +
    `## 5. Discusión\n${discusion}\n\n` +
    `## 6. Conclusiones\n${conclusiones}\n\n` +
    `## Referencias\n${referenciasTexto}\n`;

  localStorage.setItem("articulo_cientifico", doc);
  return doc;
}
