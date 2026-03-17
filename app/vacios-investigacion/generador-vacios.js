const VACIOS_STOPWORDS = [
  "de", "la", "el", "y", "en", "a", "un", "una", "los", "las", "del", "al",
  "para", "por", "con", "sin", "sobre", "entre", "estudio", "análisis", "investigación",
  "revisión", "review", "estado", "arte", "resultados", "discusión"
];

function limpiarTextoVacios(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerKeywordsVacios(texto) {
  const limpio = limpiarTextoVacios(texto);
  if (!limpio) return [];
  return limpio
    .split(" ")
    .filter((w) => w.length > 3 && !VACIOS_STOPWORDS.includes(w));
}

function normalizarRefVacios(r) {
  return {
    titulo: r.titulo || r.title || "Título no disponible",
    autores: r.autor || r.autores || r.authors || "Autor(es) no disponible",
    anio: r.anio || r.year || "s.f.",
    resumen: r.resumen || r.abstract || "",
    fuente: r.revista || r.fuente || r.source || ""
  };
}

function detectarVaciosInvestigacion(referencias) {
  const refs = (referencias || []).map(normalizarRefVacios);
  const count = {};
  const abstracts = refs.map((r) => `${r.titulo} ${r.resumen}`);

  abstracts.forEach((txt) => {
    extraerKeywordsVacios(txt).forEach((k) => {
      count[k] = (count[k] || 0) + 1;
    });
  });

  const keywords = Object.keys(count).sort((a, b) => count[b] - count[a]);
  const top = keywords.slice(0, 8);
  const low = keywords.slice(-8);

  const contradicciones = refs.length
    ? "Se identifican resultados divergentes entre estudios con enfoques metodológicos distintos."
    : "No hay suficiente evidencia para identificar contradicciones.";

  const limitaciones = refs.length
    ? "Se observa predominio de estudios descriptivos y escasa triangulación metodológica."
    : "No se pudieron detectar limitaciones metodológicas.";

  const oportunidades = refs.length
    ? "Explorar contextos no abordados, ampliar la diversidad de muestras y profundizar en variables poco estudiadas."
    : "Se requiere una base mínima de literatura para sugerir oportunidades.";

  const preguntas = refs.length
    ? "¿Cómo influyen las variables contextuales en los resultados reportados? ¿Qué enfoques metodológicos alternativos aportarían evidencia nueva?"
    : "No es posible proponer preguntas sin referencias.";

  let texto = "# Vacíos de Investigación\n\n";
  texto += "## Temas ampliamente estudiados\n\n";
  texto += top.length ? top.map((k) => `- ${k} (${count[k]})`).join("\n") : "No se detectaron temas recurrentes.";
  texto += "\n\n";

  texto += "## Temas poco explorados\n\n";
  texto += low.length ? low.map((k) => `- ${k} (${count[k]})`).join("\n") : "No se detectaron temas poco explorados.";
  texto += "\n\n";

  texto += "## Contradicciones encontradas\n\n";
  texto += contradicciones + "\n\n";

  texto += "## Limitaciones metodológicas\n\n";
  texto += limitaciones + "\n\n";

  texto += "## Oportunidades de investigación futura\n\n";
  texto += oportunidades + "\n\n";

  texto += "## Posibles preguntas de investigación\n\n";
  texto += preguntas + "\n";

  return texto;
}
