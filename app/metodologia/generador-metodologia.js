function obtenerTemaMetodologia() {
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
  return "Tema de investigación";
}

function extraerVariablesMetodologia(hipotesis) {
  const vars = [];
  const match = (hipotesis || "").match(/\*\*(.*?)\*\*/g) || [];
  match.forEach((m) => {
    const v = m.replace(/\*\*/g, "").trim();
    if (v && vars.indexOf(v) === -1) vars.push(v);
  });
  return vars.slice(0, 5);
}

function sugerirTipoInvestigacion(tema, hipotesis) {
  if ((hipotesis || "").toLowerCase().includes("relación")) return "Correlacional y explicativa";
  if ((tema || "").toLowerCase().includes("impacto")) return "Cuasi experimental";
  return "Descriptiva y analítica";
}

function generarMetodologia(referencias, hipotesis, vacios, estadoArte) {
  const tema = obtenerTemaMetodologia();
  const tipo = sugerirTipoInvestigacion(tema, hipotesis);
  const vars = extraerVariablesMetodologia(hipotesis);
  const refs = referencias || [];

  const variables = vars.length ? vars.map((v) => `- ${v}`).join("\n") : "- variables por definir";
  const indicadores = vars.length ? vars.map((v) => `- Indicadores asociados a ${v}`).join("\n") : "- indicadores por definir";

  const justificacion = vacios
    ? "La estrategia metodológica se justifica por los vacíos detectados en la literatura, lo que exige un enfoque que permita cubrir contextos poco explorados."
    : "La estrategia metodológica se selecciona para responder al objetivo y garantizar rigor científico.";

  const referenciasTexto = refs.length
    ? "Se consideran métodos sugeridos en estudios previos, especialmente aquellos con mayor rigor empírico y validez." 
    : "No se encontraron referencias suficientes para sugerir métodos específicos.";

  let texto = "# Metodología de la investigación\n\n";
  texto += "## Tipo de investigación\n\n";
  texto += `El estudio se enmarca en un enfoque **${tipo}**, adecuado para analizar el tema **${tema}** y contrastar las hipótesis planteadas.\n\n`;

  texto += "## Diseño metodológico\n\n";
  texto += "Se propone un diseño mixto con fases documentales y de análisis empírico, permitiendo articular teoría y evidencia.\n\n";

  texto += "## Variables\n\n" + variables + "\n\n";
  texto += "## Indicadores\n\n" + indicadores + "\n\n";

  texto += "## Población\n\n";
  texto += "La población objetivo está compuesta por los actores o unidades vinculadas al fenómeno estudiado, definidos según criterios de pertinencia.\n\n";

  texto += "## Muestra\n\n";
  texto += "Se seleccionará una muestra representativa mediante criterios intencionales o probabilísticos según disponibilidad de datos.\n\n";

  texto += "## Instrumentos de recolección de datos\n\n";
  texto += "Se utilizarán instrumentos como cuestionarios, guías de entrevista o matrices de análisis documental, según la naturaleza del estudio.\n\n";

  texto += "## Procedimiento\n\n";
  texto += "El procedimiento comprende la revisión de literatura, el diseño de instrumentos, la recolección de datos y el análisis sistemático de resultados.\n\n";

  texto += "## Técnicas de análisis de datos\n\n";
  texto += "Se aplicarán técnicas de análisis cualitativo y cuantitativo (según corresponda), priorizando la triangulación y la consistencia de hallazgos.\n\n";

  texto += "**Justificación metodológica:** " + justificacion + "\n\n";
  texto += "**Referencias metodológicas:** " + referenciasTexto + "\n\n";

  if (estadoArte) {
    texto += "**Aportes del estado del arte:**\n" + estadoArte.slice(0, 400) + "...\n\n";
  }
  if (hipotesis) {
    texto += "**Hipótesis consideradas:**\n" + hipotesis.slice(0, 400) + "...\n\n";
  }

  return texto;
}
