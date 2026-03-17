const TENDENCIAS_STOPWORDS = [
  "de", "la", "el", "y", "en", "a", "un", "una", "los", "las", "del", "al",
  "para", "por", "con", "sin", "sobre", "entre", "estudio", "análisis", "investigación",
  "revisión", "review", "estado", "arte", "resultados", "discusión"
];

function limpiarTextoTendencias(texto) {
  return String(texto || "")
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerKeywordsTendencias(texto) {
  const limpio = limpiarTextoTendencias(texto);
  if (!limpio) return [];
  return limpio
    .split(" ")
    .filter((w) => w.length > 3 && !TENDENCIAS_STOPWORDS.includes(w));
}

function normalizarRefTendencias(r) {
  return {
    titulo: r.titulo || r.title || "",
    autores: r.autor || r.autores || r.authors || "",
    anio: r.anio || r.year || "",
    resumen: r.resumen || r.abstract || ""
  };
}

function generarTendenciasCientificas(referencias) {
  const refs = (referencias || []).map(normalizarRefTendencias);
  const yearsCount = {};
  const keywordsCount = {};
  const autoresCount = {};

  refs.forEach((r) => {
    const y = String(r.anio || "").trim();
    if (y) yearsCount[y] = (yearsCount[y] || 0) + 1;

    const kws = extraerKeywordsTendencias(`${r.titulo} ${r.resumen}`);
    kws.forEach((k) => {
      keywordsCount[k] = (keywordsCount[k] || 0) + 1;
    });

    const autores = String(r.autores || "").split(";").map((a) => a.trim()).filter(Boolean);
    autores.forEach((a) => {
      autoresCount[a] = (autoresCount[a] || 0) + 1;
    });
  });

  const years = Object.keys(yearsCount).sort();
  const topKeywords = Object.keys(keywordsCount).sort((a, b) => keywordsCount[b] - keywordsCount[a]).slice(0, 12);
  const topAutores = Object.keys(autoresCount).sort((a, b) => autoresCount[b] - autoresCount[a]).slice(0, 10);

  const temasPred = topKeywords.slice(0, 6);

  const md = [];
  md.push("# Tendencias Científicas");
  md.push("\n## Evolución temporal\n");
  md.push(years.length ? years.map((y) => `- ${y}: ${yearsCount[y]}`).join("\n") : "No hay años registrados.");
  md.push("\n\n## Palabras clave dominantes\n");
  md.push(topKeywords.length ? topKeywords.map((k) => `- ${k} (${keywordsCount[k]})`).join("\n") : "No se detectaron palabras clave.");
  md.push("\n\n## Autores más influyentes\n");
  md.push(topAutores.length ? topAutores.map((a) => `- ${a} (${autoresCount[a]})`).join("\n") : "No se detectaron autores.");
  md.push("\n\n## Temas predominantes\n");
  md.push(temasPred.length ? temasPred.map((t) => `- ${t}`).join("\n") : "No se detectaron temas.");
  md.push("\n\n## Interpretación de tendencias\n");
  md.push("La producción académica muestra patrones de concentración temática y evolución temporal. Se observan líneas emergentes asociadas a los términos dominantes y una consolidación de autores recurrentes.");

  return {
    markdown: md.join(""),
    years,
    yearsCount,
    topKeywords,
    keywordsCount,
    topAutores,
    autoresCount,
    temasPred
  };
}
