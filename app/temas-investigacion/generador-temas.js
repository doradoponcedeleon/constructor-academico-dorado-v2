const TEMAS_STOPWORDS = [
  "de", "la", "el", "y", "en", "a", "un", "una", "los", "las", "del", "al",
  "para", "por", "con", "sin", "sobre", "entre", "estudio", "análisis", "investigación",
  "revisión", "review", "estado", "arte", "resultados", "discusión"
];

function limpiarTextoTemas(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerKeywordsTemas(texto) {
  const limpio = limpiarTextoTemas(texto);
  if (!limpio) return [];
  return limpio
    .split(" ")
    .filter((w) => w.length > 3 && !TEMAS_STOPWORDS.includes(w));
}

function normalizarRefTemas(r) {
  return {
    titulo: r.titulo || r.title || "",
    resumen: r.resumen || r.abstract || ""
  };
}

function generarTemasInvestigacion(referencias, vacios, estadoArte) {
  const refs = (referencias || []).map(normalizarRefTemas);
  const keywordsCount = {};
  refs.forEach((r) => {
    const kws = extraerKeywordsTemas(`${r.titulo} ${r.resumen}`);
    kws.forEach((k) => {
      keywordsCount[k] = (keywordsCount[k] || 0) + 1;
    });
  });

  const keywords = Object.keys(keywordsCount).sort((a, b) => keywordsCount[b] - keywordsCount[a]);
  const base = keywords.slice(0, 10);
  const secundarios = keywords.slice(10, 20);

  const vaciosTexto = vacios || "";
  const vacioKw = extraerKeywordsTemas(vaciosTexto).slice(0, 6);

  const temas = [];
  for (let i = 0; i < 5; i++) {
    const k1 = base[i] || "fenómeno";
    const k2 = secundarios[i] || vacioKw[i] || "contexto";
    const titulo = `Relación entre ${k1} y ${k2} en escenarios académicos contemporáneos`;
    const justificacion = `Este tema surge al identificar brechas en el tratamiento de **${k2}** dentro de estudios sobre **${k1}**. ` +
      `El estado del arte muestra una necesidad de profundizar en enfoques integradores y multidisciplinares.`;
    const variables = `- ${k1}\n- ${k2}\n- variables contextuales (socioeconómicas, institucionales, culturales)`;
    const enfoque = "Enfoque mixto con predominio descriptivo-explicativo, combinando análisis documental y trabajo de campo.";
    temas.push({ titulo, justificacion, variables, enfoque });
  }

  let texto = "# Temas de Investigación Sugeridos\n\n";
  temas.forEach((t, idx) => {
    texto += `## Tema ${idx + 1}\n` +
      `**${t.titulo}**\n\n` +
      `## Justificación\n${t.justificacion}\n\n` +
      `## Variables posibles\n${t.variables}\n\n` +
      `## Enfoque metodológico sugerido\n${t.enfoque}\n\n`;
  });

  if (estadoArte) {
    texto += "**Aportes del estado del arte:**\n" + estadoArte.slice(0, 300) + "...\n\n";
  }

  return texto;
}
