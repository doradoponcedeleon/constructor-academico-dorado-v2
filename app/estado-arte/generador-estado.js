const ESTADO_STOPWORDS = [
  "de", "la", "el", "y", "en", "a", "un", "una", "los", "las", "del", "al",
  "para", "por", "con", "sin", "sobre", "entre", "estudio", "análisis", "investigación",
  "estado", "arte", "revisión", "review"
];

function limpiarTextoEstado(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerKeywordsEstado(texto) {
  const limpio = limpiarTextoEstado(texto);
  if (!limpio) return [];
  return limpio
    .split(" ")
    .filter((w) => w.length > 3 && !ESTADO_STOPWORDS.includes(w));
}

function normalizarRefEstado(r) {
  return {
    titulo: r.titulo || r.title || "Título no disponible",
    autores: r.autor || r.autores || r.authors || "Autor(es) no disponible",
    anio: r.anio || r.year || "s.f.",
    resumen: r.resumen || r.abstract || "",
    fuente: r.revista || r.fuente || r.source || ""
  };
}

function generarEstadoArte(referencias) {
  const refs = (referencias || []).map(normalizarRefEstado);
  const keywordsCount = {};
  const autoresCount = {};
  const yearsCount = {};

  refs.forEach((r) => {
    const kws = extraerKeywordsEstado(`${r.titulo} ${r.resumen}`);
    kws.forEach((k) => {
      keywordsCount[k] = (keywordsCount[k] || 0) + 1;
    });
    const autores = String(r.autores || "").split(";").map((a) => a.trim()).filter(Boolean);
    autores.forEach((a) => {
      autoresCount[a] = (autoresCount[a] || 0) + 1;
    });
    const y = String(r.anio || "").trim();
    if (y) yearsCount[y] = (yearsCount[y] || 0) + 1;
  });

  const topKeywords = Object.keys(keywordsCount).sort((a, b) => keywordsCount[b] - keywordsCount[a]).slice(0, 15);
  const topAutores = Object.keys(autoresCount).sort((a, b) => autoresCount[b] - autoresCount[a]).slice(0, 10);
  const years = Object.keys(yearsCount).sort();

  let texto = "# Estado del Arte\n\n";
  texto += "## Palabras clave frecuentes\n\n";
  texto += topKeywords.length ? topKeywords.map((k) => `- ${k} (${keywordsCount[k]})`).join("\n") : "No se detectaron palabras clave.";
  texto += "\n\n";

  texto += "## Autores destacados\n\n";
  texto += topAutores.length ? topAutores.map((a) => `- ${a} (${autoresCount[a]})`).join("\n") : "No se detectaron autores.";
  texto += "\n\n";

  texto += "## Distribución temporal\n\n";
  texto += years.length ? years.map((y) => `- ${y}: ${yearsCount[y]}`).join("\n") : "No hay años registrados.";
  texto += "\n\n";

  texto += "## Síntesis\n\n";
  texto += "El análisis muestra los temas más recurrentes, los autores más citados y la evolución temporal de la producción académica. Estos patrones ayudan a identificar áreas consolidadas y vacíos de investigación.\n";

  return texto;
}
