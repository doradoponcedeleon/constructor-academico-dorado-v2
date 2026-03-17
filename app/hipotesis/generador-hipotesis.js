function extraerTemaHipotesis() {
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

function extraerVariablesDesdeReferencias(refs) {
  const set = new Set();
  (refs || []).forEach((r) => {
    const titulo = `${r.titulo || r.title || ""} ${r.resumen || r.abstract || ""}`.toLowerCase();
    titulo.split(/\s+/).forEach((w) => {
      if (w.length > 5) set.add(w.replace(/[^a-záéíóúüñ0-9]/gi, ""));
    });
  });
  return Array.from(set).slice(0, 8);
}

function generarHipotesis(referencias, vacios, estadoArte) {
  const tema = extraerTemaHipotesis();
  const vars = extraerVariablesDesdeReferencias(referencias);

  const hipGeneral = `H1: Existe una relación significativa entre los factores clave asociados al tema **${tema}** y los resultados observables en el contexto de estudio.`;
  const hipEspecificas = [
    `H1a: La variable **${vars[0] || "variable A"}** influye positivamente sobre **${vars[1] || "variable B"}** en el tema **${tema}**.`,
    `H1b: La presencia de **${vars[2] || "variable C"}** modifica la intensidad de los efectos identificados en **${tema}**.`,
    `H1c: Los factores contextuales amplían o restringen el impacto de **${vars[3] || "variable D"}** en el desarrollo de **${tema}**.`
  ];

  const vaciosTexto = vacios || "";
  const estadoTexto = estadoArte || "";

  const varsTexto = vars.length ? vars.map((v) => `- ${v}`).join("\n") : "- variables no identificadas";

  const relacion = "Se propone un modelo en el que las variables identificadas actúan de manera conjunta y mediada por condiciones contextuales, generando resultados observables en el fenómeno estudiado.";

  const modelo = "El modelo conceptual integra variables independientes, mediadoras y dependientes, permitiendo explicar la dinámica del tema de investigación a partir de evidencias previas y vacíos detectados.";

  let texto = "# Hipótesis de Investigación\n\n";
  texto += "## Hipótesis general\n\n" + hipGeneral + "\n\n";
  texto += "## Hipótesis específicas\n\n" + hipEspecificas.map((h) => `- ${h}`).join("\n") + "\n\n";
  texto += "## Variables principales\n\n" + varsTexto + "\n\n";
  texto += "## Relación entre variables\n\n" + relacion + "\n\n";
  texto += "## Posible modelo conceptual\n\n" + modelo + "\n\n";

  if (estadoTexto) {
    texto += "**Aportes del estado del arte:**\n" + estadoTexto.slice(0, 400) + "...\n\n";
  }
  if (vaciosTexto) {
    texto += "**Vacíos detectados:**\n" + vaciosTexto.slice(0, 400) + "...\n\n";
  }

  return texto;
}
